-- Create RLS policies for n8n service role access
-- Allow service role full access to metas table
CREATE POLICY "Service role full access to metas" 
ON public.metas 
FOR ALL 
TO service_role
USING (true) 
WITH CHECK (true);

-- Allow service role full access to pagamentos_parcelados table
CREATE POLICY "Service role full access to pagamentos_parcelados" 
ON public.pagamentos_parcelados 
FOR ALL 
TO service_role
USING (true) 
WITH CHECK (true);

-- Allow service role full access to profiles table
CREATE POLICY "Service role full access to profiles" 
ON public.profiles 
FOR ALL 
TO service_role
USING (true) 
WITH CHECK (true);

-- Allow service role full access to transacoes table
CREATE POLICY "Service role full access to transacoes" 
ON public.transacoes 
FOR ALL 
TO service_role
USING (true) 
WITH CHECK (true);

-- Allow service role full access to users table
CREATE POLICY "Service role full access to users" 
ON public.users 
FOR ALL 
TO service_role
USING (true) 
WITH CHECK (true);