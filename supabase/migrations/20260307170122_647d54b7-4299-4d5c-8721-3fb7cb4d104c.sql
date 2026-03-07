
-- Delete existing demo user if any
DELETE FROM public.user_roles WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'demo@edumentor.app');
DELETE FROM public.profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'demo@edumentor.app');
DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'demo@edumentor.app');
DELETE FROM auth.users WHERE email = 'demo@edumentor.app';

-- Create demo user with proper password hash
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token
)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '00000000-0000-0000-0000-000000000000',
  'demo@edumentor.app',
  crypt('Demo@12345', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"display_name": "مرشد تجريبي"}',
  now(),
  now(),
  'authenticated',
  'authenticated',
  ''
);

-- Create identity for the demo user
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  jsonb_build_object('sub', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'email', 'demo@edumentor.app'),
  'email',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  now(),
  now(),
  now()
);

-- Ensure profile exists
INSERT INTO public.profiles (user_id, display_name)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'مرشد تجريبي')
ON CONFLICT (user_id) DO NOTHING;

-- Ensure counselor role exists
INSERT INTO public.user_roles (user_id, role)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'counselor')
ON CONFLICT (user_id, role) DO NOTHING;
