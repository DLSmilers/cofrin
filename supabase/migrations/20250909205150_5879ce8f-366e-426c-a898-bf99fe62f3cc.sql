-- Função para verificar se o período de teste expirou
CREATE OR REPLACE FUNCTION public.check_trial_expired(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT 
      CASE 
        WHEN trial_end_date < now() THEN true
        ELSE false
      END
    FROM public.profiles 
    WHERE user_id = user_uuid
  );
END;
$$;