-- Drop the complex policy and create a simpler one for dashboard access
DROP POLICY IF EXISTS "Unified transaction access policy" ON public.transacoes;

-- Create a simpler policy that specifically allows dashboard access
CREATE POLICY "Allow dashboard access" ON public.transacoes
FOR SELECT 
TO anon, authenticated
USING (true);