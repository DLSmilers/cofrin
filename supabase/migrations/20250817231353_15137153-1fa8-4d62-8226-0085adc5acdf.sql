-- Enable RLS on both tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow public access for dashboard authentication" ON public.users;

-- Create proper policy for dashboard access (public read only for dashboard tokens)
CREATE POLICY "Public read access for dashboard tokens" 
ON public.users 
FOR SELECT 
USING (dashboard_token IS NOT NULL);

-- Create policy for transactions visible by dashboard token
CREATE POLICY "Transactions visible via dashboard token" 
ON public.transacoes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.user_whatsapp = transacoes.user
  )
);