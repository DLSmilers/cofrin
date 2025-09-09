-- Inserir perfil para usuário existente que não teve o trigger executado
INSERT INTO public.profiles (
  user_id, 
  first_name, 
  last_name, 
  whatsapp,
  phone_whatsapp,
  trial_start_date,
  trial_end_date
)
VALUES (
  'f40feff7-c65b-47f0-aefc-cfeb173e6cc9'::uuid,
  'Daniel',
  'Miranda', 
  '7198117133',
  '7198117133',
  now(),
  now() + interval '30 days'
)
ON CONFLICT (user_id) DO NOTHING;