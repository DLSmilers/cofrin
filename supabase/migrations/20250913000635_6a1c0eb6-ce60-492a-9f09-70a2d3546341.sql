-- Fix admin_get_all_users function type mismatch
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE(
    user_id UUID,
    email character varying,  -- Changed from TEXT to character varying to match auth.users.email type
    created_at TIMESTAMP WITH TIME ZONE,
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    profile_data JSONB,
    role app_role,
    total_transactions BIGINT,
    total_amount NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if current user is admin
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;
    
    RETURN QUERY
    SELECT 
        au.id as user_id,
        au.email,
        au.created_at,
        au.last_sign_in_at,
        to_jsonb(p.*) as profile_data,
        COALESCE(ur.role, 'user'::app_role) as role,
        COUNT(t.id) as total_transactions,
        COALESCE(SUM(t.valor), 0) as total_amount
    FROM auth.users au
    LEFT JOIN public.profiles p ON p.user_id = au.id
    LEFT JOIN public.user_roles ur ON ur.user_id = au.id
    LEFT JOIN public.users u ON u.uuid = au.id
    LEFT JOIN public.transacoes t ON t.user_whatsapp = u.user_whatsapp
    GROUP BY au.id, au.email, au.created_at, au.last_sign_in_at, p.*, ur.role
    ORDER BY au.created_at DESC;
END;
$$;