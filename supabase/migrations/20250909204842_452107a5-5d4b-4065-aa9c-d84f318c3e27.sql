-- Atualizar função validate_dashboard_token para usar a tabela profiles
CREATE OR REPLACE FUNCTION public.validate_dashboard_token(token_input text)
 RETURNS TABLE(user_uuid uuid, user_name text, user_whatsapp text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Return data if token matches using profiles table
  RETURN QUERY
  SELECT 
    p.user_id as user_uuid,
    (p.first_name || ' ' || p.last_name) as user_name,
    p.whatsapp as user_whatsapp
  FROM public.profiles p
  WHERE p.user_id::text = token_input;
END;
$function$;