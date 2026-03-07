UPDATE auth.users 
SET encrypted_password = crypt('Demo@12345', gen_salt('bf')),
    email_confirmed_at = now()
WHERE email = 'demo@edumentor.app';