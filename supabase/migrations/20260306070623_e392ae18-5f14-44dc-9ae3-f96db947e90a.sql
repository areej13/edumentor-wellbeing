
-- Drop the restrictive policy and recreate as permissive
DROP POLICY IF EXISTS "Anyone can submit reports" ON public.reports;

CREATE POLICY "Anyone can submit reports"
ON public.reports
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
