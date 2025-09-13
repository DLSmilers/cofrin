-- Add support for weekly goals
ALTER TABLE public.metas 
ADD COLUMN tipo_meta TEXT CHECK (tipo_meta IN ('mensal', 'semanal')) DEFAULT 'mensal',
ADD COLUMN semana_ano TEXT;

-- Create index for better performance
CREATE INDEX idx_metas_tipo_meta ON public.metas(tipo_meta);
CREATE INDEX idx_metas_semana_ano ON public.metas(semana_ano);

-- Update existing records to be monthly
UPDATE public.metas SET tipo_meta = 'mensal' WHERE tipo_meta IS NULL;