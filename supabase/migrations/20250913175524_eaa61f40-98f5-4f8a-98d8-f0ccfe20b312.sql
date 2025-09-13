-- Fix RLS policies for transacoes table to handle WhatsApp format correctly
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transacoes;
DROP POLICY IF EXISTS "Users can delete only their own transactions" ON public.transacoes;
DROP POLICY IF EXISTS "Users can update only their own transactions" ON public.transacoes;
DROP POLICY IF EXISTS "Users can insert only their own transactions" ON public.transacoes;

-- Create corrected policies
CREATE POLICY "Users can view their own transactions" 
ON public.transacoes 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.user_whatsapp = transacoes.user_whatsapp 
  AND users.uuid = auth.uid()
));

CREATE POLICY "Users can insert their own transactions" 
ON public.transacoes 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.user_whatsapp = transacoes.user_whatsapp 
  AND users.uuid = auth.uid()
));

CREATE POLICY "Users can update their own transactions" 
ON public.transacoes 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.user_whatsapp = transacoes.user_whatsapp 
  AND users.uuid = auth.uid()
));

CREATE POLICY "Users can delete their own transactions" 
ON public.transacoes 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.user_whatsapp = transacoes.user_whatsapp 
  AND users.uuid = auth.uid()
));