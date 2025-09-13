-- Fix validate_dashboard_token function to return correct user_whatsapp from users table
CREATE OR REPLACE FUNCTION public.validate_dashboard_token(token_input text)
RETURNS TABLE(user_uuid uuid, user_name text, user_whatsapp text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Return data if token matches using both profiles and users tables
  RETURN QUERY
  SELECT 
    p.user_id as user_uuid,
    (p.first_name || ' ' || p.last_name) as user_name,
    u.user_whatsapp as user_whatsapp  -- Use user_whatsapp from users table
  FROM public.profiles p
  INNER JOIN public.users u ON u.uuid = p.user_id
  WHERE p.user_id::text = token_input;
END;
$function$;