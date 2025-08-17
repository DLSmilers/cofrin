-- Remove all existing SELECT policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users see own transactions only" ON public.transacoes;
DROP POLICY IF EXISTS "Dashboard token access to transactions" ON public.transacoes;
DROP POLICY IF EXISTS "Users can view only their own transactions" ON public.transacoes;

-- Create unified policy that allows both authenticated users and dashboard token access
CREATE POLICY "Unified transaction access policy" ON public.transacoes
FOR SELECT 
USING (
  -- Allow authenticated users to see their own transactions
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.user_whatsapp = transacoes.user 
    AND users.uuid = auth.uid()
  ))
  OR
  -- Allow dashboard access for any user with a valid dashboard token
  (EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.user_whatsapp = transacoes.user 
    AND u.dashboard_token IS NOT NULL
  ))
);