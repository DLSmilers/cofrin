-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Public read access for dashboard tokens" ON public.users;
DROP POLICY IF EXISTS "Transactions visible via dashboard token" ON public.transacoes;

-- Create simple policy allowing all users to read from users table (needed for dashboard access)
CREATE POLICY "Allow dashboard token lookup" 
ON public.users 
FOR SELECT 
USING (true);

-- Create policy allowing public access to view transactions
CREATE POLICY "Allow public transaction access" 
ON public.transacoes 
FOR SELECT 
USING (true);