-- Fix critical security vulnerability: Remove public read access to users table
-- and implement proper RLS policies

-- Drop the problematic policy that allows public read access
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;

-- Create a new policy that only allows users to view their own data
CREATE POLICY "Users can view their own data" ON public.users
FOR SELECT 
USING (uuid = auth.uid());

-- Create a policy for admins to view all user data when needed
CREATE POLICY "Admins can view all users" ON public.users
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- The service role policy already exists and will continue to work for system functions