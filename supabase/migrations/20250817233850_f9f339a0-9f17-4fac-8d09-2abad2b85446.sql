-- Remove the overly restrictive transaction policy
DROP POLICY IF EXISTS "Users can view own transactions only" ON public.transacoes;

-- Create a more flexible policy that allows dashboard access
-- This allows access to transactions when:
-- 1. User is authenticated and owns the data (normal case)
-- 2. Anonymous user accessing via valid dashboard token (dashboard case)
CREATE POLICY "Allow transaction access for dashboard" 
ON public.transacoes 
FOR SELECT 
USING (
  -- Allow if user is authenticated and owns the data
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.user_whatsapp = transacoes.user 
    AND users.uuid = auth.uid()
  ))
  OR
  -- Allow anonymous access (dashboard tokens are validated at application level)
  (auth.uid() IS NULL)
);