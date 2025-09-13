-- Fix critical security vulnerability: Remove public read access to transactions table
-- and implement proper RLS policies for financial data protection

-- Drop the problematic policy that allows public read access to all transactions
DROP POLICY IF EXISTS "Enable read access for all users" ON public.transacoes;

-- Create a new policy that only allows users to view their own transactions
CREATE POLICY "Users can view their own transactions" ON public.transacoes
FOR SELECT 
USING (EXISTS (
  SELECT 1 
  FROM public.users 
  WHERE users.user_whatsapp = transacoes.user_whatsapp 
  AND users.uuid = auth.uid()
));

-- Create a policy for admins to view all transactions when needed for administration
CREATE POLICY "Admins can view all transactions" ON public.transacoes
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- The service role policy already exists and will continue to work for system functions