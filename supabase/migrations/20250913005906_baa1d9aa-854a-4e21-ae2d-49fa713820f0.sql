-- Criar tabela para pagamentos parcelados
CREATE TABLE public.pagamentos_parcelados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_whatsapp TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT,
  estabelecimento TEXT,
  valor_total DOUBLE PRECISION NOT NULL,
  valor_parcela DOUBLE PRECISION NOT NULL,
  total_parcelas INTEGER NOT NULL,
  parcela_atual INTEGER NOT NULL,
  data_vencimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'paga', 'atrasada')),
  transacao_id BIGINT, -- referência opcional para transação que pagou esta parcela
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.pagamentos_parcelados ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pagamentos parcelados
CREATE POLICY "Users can view their own parceled payments" 
ON public.pagamentos_parcelados 
FOR SELECT 
USING (
  user_whatsapp IN (
    SELECT users.user_whatsapp 
    FROM users 
    WHERE users.uuid = auth.uid()
  )
);

CREATE POLICY "Users can insert their own parceled payments" 
ON public.pagamentos_parcelados 
FOR INSERT 
WITH CHECK (
  user_whatsapp IN (
    SELECT users.user_whatsapp 
    FROM users 
    WHERE users.uuid = auth.uid()
  )
);

CREATE POLICY "Users can update their own parceled payments" 
ON public.pagamentos_parcelados 
FOR UPDATE 
USING (
  user_whatsapp IN (
    SELECT users.user_whatsapp 
    FROM users 
    WHERE users.uuid = auth.uid()
  )
);

CREATE POLICY "Users can delete their own parceled payments" 
ON public.pagamentos_parcelados 
FOR DELETE 
USING (
  user_whatsapp IN (
    SELECT users.user_whatsapp 
    FROM users 
    WHERE users.uuid = auth.uid()
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_pagamentos_parcelados_updated_at
BEFORE UPDATE ON public.pagamentos_parcelados
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_pagamentos_parcelados_user_whatsapp ON public.pagamentos_parcelados(user_whatsapp);
CREATE INDEX idx_pagamentos_parcelados_status ON public.pagamentos_parcelados(status);
CREATE INDEX idx_pagamentos_parcelados_data_vencimento ON public.pagamentos_parcelados(data_vencimento);