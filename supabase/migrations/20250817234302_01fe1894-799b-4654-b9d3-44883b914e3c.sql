-- Remove the insecure policy that allows anonymous access to all transactions
DROP POLICY IF EXISTS "Allow transaction access for dashboard" ON public.transacoes;

-- Create secure policy: only authenticated users can see their own transactions
CREATE POLICY "Authenticated users see own transactions only"
ON public.transacoes
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.user_whatsapp = transacoes.user 
    AND users.uuid = auth.uid()
  )
);

-- Create secure function that validates token AND returns transactions in one call
CREATE OR REPLACE FUNCTION public.get_dashboard_data(token_input text)
RETURNS TABLE(
  user_uuid uuid,
  user_name text,
  user_whatsapp text,
  transaction_id bigint,
  transaction_valor double precision,
  transaction_user text,
  transaction_estabelecimento text,
  transaction_detalhes text,
  transaction_tipo text,
  transaction_categoria text,
  transaction_created_at timestamp with time zone,
  transaction_quando timestamp without time zone
) AS $$
BEGIN
  -- First validate the token and get user info
  -- If token is invalid, return empty result
  RETURN QUERY
  SELECT 
    u.uuid as user_uuid,
    u.nome as user_name,
    u.user_whatsapp as user_whatsapp,
    t.id as transaction_id,
    t.valor as transaction_valor,
    t."user" as transaction_user,
    t.estabelecimento as transaction_estabelecimento,
    t.detalhes as transaction_detalhes,
    t.tipo as transaction_tipo,
    t.categoria as transaction_categoria,
    t.created_at as transaction_created_at,
    t.quando as transaction_quando
  FROM public.users u
  LEFT JOIN public.transacoes t ON t."user" = u.user_whatsapp
  WHERE u.dashboard_token = token_input
  ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission on the new function to anon role
GRANT EXECUTE ON FUNCTION public.get_dashboard_data(text) TO anon;