-- Forçar expiração do trial para o usuário dlsmiler.dm@gmail.com
UPDATE public.profiles 
SET trial_end_date = '2025-01-01 00:00:00+00'
FROM auth.users 
WHERE profiles.user_id = auth.users.id 
AND auth.users.email = 'dlsmiler.dm@gmail.com';