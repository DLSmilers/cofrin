-- Deletar o usuário restante na tabela auth.users para permitir cadastro novo
DELETE FROM auth.users WHERE email = 'dlsmiler@hotmail.com';