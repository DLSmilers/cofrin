-- Allow public access to users table for dashboard authentication
CREATE POLICY "Allow public access for dashboard authentication" 
ON public.users 
FOR SELECT 
USING (true);