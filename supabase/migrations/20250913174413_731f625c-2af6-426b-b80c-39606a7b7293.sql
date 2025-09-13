-- Fix WhatsApp formatting to include country code 55
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  whatsapp_formatted text;
  phone_number text;
BEGIN
  -- Get the phone number and clean it
  phone_number := regexp_replace(
    COALESCE(NEW.raw_user_meta_data->>'phone_whatsapp', ''),
    '[^0-9]', '', 'g'
  );
  
  -- Format the whatsapp number for the users table
  -- Add country code 55 if not present
  IF phone_number != '' THEN
    IF NOT phone_number LIKE '55%' THEN
      whatsapp_formatted := '55' || phone_number || '@s.whatsapp.net';
    ELSE
      whatsapp_formatted := phone_number || '@s.whatsapp.net';
    END IF;
  ELSE
    whatsapp_formatted := '';
  END IF;

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

  -- Insert into users table
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

  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  -- Log the registration
  INSERT INTO public.access_logs (user_id, action, details)
  VALUES (NEW.id, 'user_registration', '{"source": "signup_page"}'::jsonb);

  RETURN NEW;
END;
$function$;