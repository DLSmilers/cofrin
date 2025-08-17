-- Remove the insecure public policy
DROP POLICY IF EXISTS "Allow dashboard token lookup" ON public.users;
DROP POLICY IF EXISTS "Allow public transaction access" ON public.transacoes;

-- Create secure function for dashboard token validation
CREATE OR REPLACE FUNCTION public.validate_dashboard_token(token_input text)
RETURNS TABLE(
  user_uuid uuid,
  user_name text,
  user_whatsapp text
) AS $$
BEGIN
  -- Only return data if token matches exactly
  RETURN QUERY
  SELECT 
    u.uuid,
    u.nome,
    u.user_whatsapp
  FROM public.users u
  WHERE u.dashboard_token = token_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create secure policy for users table (only own data)
CREATE POLICY "Users can view own profile only"
ON public.users
FOR SELECT
USING (uuid = auth.uid());

-- Create secure policy for transactions (only own transactions)
CREATE POLICY "Users can view own transactions only"
ON public.transacoes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.user_whatsapp = transacoes.user 
    AND users.uuid = auth.uid()
  )
);

-- Grant execute permission on the function to anon role (for dashboard access)
GRANT EXECUTE ON FUNCTION public.validate_dashboard_token(text) TO anon;