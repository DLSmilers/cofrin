-- Fix the search_path security issue
CREATE OR REPLACE FUNCTION public.validate_dashboard_token(token_input text)
RETURNS TABLE(
  user_uuid uuid,
  user_name text,
  user_whatsapp text
) AS $$
BEGIN
  -- Only return data if token matches exactly
  RETURN QUERY
  SELECT 
    u.uuid,
    u.nome,
    u.user_whatsapp
  FROM public.users u
  WHERE u.dashboard_token = token_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;