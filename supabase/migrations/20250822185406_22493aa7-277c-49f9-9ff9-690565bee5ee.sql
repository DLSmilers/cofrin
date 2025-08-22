-- Drop the existing function
DROP FUNCTION IF EXISTS public.validate_dashboard_token(text);

-- Create a new function that doesn't require authentication
CREATE OR REPLACE FUNCTION public.validate_dashboard_token(token_input text)
 RETURNS TABLE(user_uuid uuid, user_name text, user_whatsapp text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Return data if token matches (no auth requirement)
  RETURN QUERY
  SELECT 
    u.uuid,
    u.nome,
    u.user_whatsapp
  FROM public.users u
  WHERE u.dashboard_token = token_input;
END;
$function$;