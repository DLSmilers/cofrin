-- Allow dashboard access to transactions via token validation
CREATE POLICY "Dashboard token access to transactions" ON public.transacoes
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.user_whatsapp = transacoes.user
    AND u.dashboard_token IS NOT NULL
  )
);