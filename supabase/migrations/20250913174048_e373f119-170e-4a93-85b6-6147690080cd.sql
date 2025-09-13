-- Create RLS policies for n8n service role access (only for tables that don't have them yet)

-- Check if service role policy exists for pagamentos_parcelados, if not create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'pagamentos_parcelados' 
        AND policyname = 'Service role full access to pagamentos_parcelados'
    ) THEN
        EXECUTE 'CREATE POLICY "Service role full access to pagamentos_parcelados" 
                 ON public.pagamentos_parcelados 
                 FOR ALL 
                 TO service_role
                 USING (true) 
                 WITH CHECK (true)';
    END IF;
END
$$;

-- Check if service role policy exists for profiles, if not create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Service role full access to profiles'
    ) THEN
        EXECUTE 'CREATE POLICY "Service role full access to profiles" 
                 ON public.profiles 
                 FOR ALL 
                 TO service_role
                 USING (true) 
                 WITH CHECK (true)';
    END IF;
END
$$;