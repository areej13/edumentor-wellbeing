
-- Clean up any orphaned data from previous migration
DELETE FROM public.user_roles WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
DELETE FROM public.profiles WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
DELETE FROM auth.identities WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
DELETE FROM auth.users WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
DELETE FROM auth.users WHERE email = 'demo@edumentor.app';
