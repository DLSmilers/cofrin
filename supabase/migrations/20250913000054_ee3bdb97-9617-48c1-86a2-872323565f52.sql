-- Create user roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Create access logs table
CREATE TABLE public.access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on access_logs
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view access logs
CREATE POLICY "Only admins can view access logs" 
ON public.access_logs 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert access logs" 
ON public.access_logs 
FOR INSERT 
WITH CHECK (true);

-- Admin function to get all users with their data
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE(
    user_id UUID,
    email TEXT,
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

-- Admin function to delete user completely
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_whatsapp_val TEXT;
BEGIN
    -- Check if current user is admin
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;
    
    -- Get user whatsapp for cascade delete
    SELECT user_whatsapp INTO user_whatsapp_val 
    FROM public.users 
    WHERE uuid = target_user_id;
    
    -- Delete related data
    DELETE FROM public.transacoes WHERE user_whatsapp = user_whatsapp_val;
    DELETE FROM public.metas WHERE user_whatsapp = user_whatsapp_val;
    DELETE FROM public.access_logs WHERE user_id = target_user_id;
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    DELETE FROM public.users WHERE uuid = target_user_id;
    DELETE FROM public.profiles WHERE user_id = target_user_id;
    
    -- Delete from auth.users (this will cascade to other tables)
    DELETE FROM auth.users WHERE id = target_user_id;
    
    RETURN TRUE;
END;
$$;

-- Update the handle_new_user function to assign default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  whatsapp_formatted text;
BEGIN
  -- Format the whatsapp number for the users table
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
$$;