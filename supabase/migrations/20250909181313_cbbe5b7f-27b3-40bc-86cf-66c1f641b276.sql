-- Enable RLS on metas table
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;

-- Create policies for metas table
CREATE POLICY "Users can view their own metas" 
ON public.metas 
FOR SELECT 
USING (user_whatsapp IN (
  SELECT user_whatsapp 
  FROM public.users 
  WHERE uuid = auth.uid()
));

CREATE POLICY "Users can insert their own metas" 
ON public.metas 
FOR INSERT 
WITH CHECK (user_whatsapp IN (
  SELECT user_whatsapp 
  FROM public.users 
  WHERE uuid = auth.uid()
));

CREATE POLICY "Users can update their own metas" 
ON public.metas 
FOR UPDATE 
USING (user_whatsapp IN (
  SELECT user_whatsapp 
  FROM public.users 
  WHERE uuid = auth.uid()
));

CREATE POLICY "Users can delete their own metas" 
ON public.metas 
FOR DELETE 
USING (user_whatsapp IN (
  SELECT user_whatsapp 
  FROM public.users 
  WHERE uuid = auth.uid()
));

-- Allow service role full access to metas
CREATE POLICY "Service role full access to metas" 
ON public.metas 
FOR ALL
USING (true)
WITH CHECK (true);