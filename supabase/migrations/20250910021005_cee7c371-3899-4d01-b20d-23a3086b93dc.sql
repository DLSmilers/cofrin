-- Update the handle_new_user function to also insert into users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  whatsapp_formatted text;
BEGIN
  -- Format the whatsapp number for the users table
  -- Remove any formatting and add the WhatsApp format
  whatsapp_formatted := regexp_replace(
    COALESCE(NEW.raw_user_meta_data->>'phone_whatsapp', ''),
    '[^0-9]', '', 'g'
  ) || '@s.whatsapp.net';

  -- Insert into profiles table
  INSERT INTO public.profiles (
    user_id, 
    first_name, 
    last_name, 
    whatsapp,
    birth_date,
    address,
    phone_whatsapp,
    trial_start_date,
    trial_end_date
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
    CASE 
      WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'birth_date')::DATE 
      ELSE NULL 
    END,
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_whatsapp', ''),
    now(),
    now() + interval '30 days'
  );

  -- Insert into users table with WhatsApp format
  INSERT INTO public.users (
    uuid,
    nome,
    user_whatsapp,
    dashboard_token
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Usuário') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    whatsapp_formatted,
    NEW.id::text
  );

  RETURN NEW;
END;
$function$;