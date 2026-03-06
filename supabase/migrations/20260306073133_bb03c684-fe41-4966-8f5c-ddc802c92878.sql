
-- Create counselor_solutions table
CREATE TABLE public.counselor_solutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  counselor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  is_reusable BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.counselor_solutions ENABLE ROW LEVEL SECURITY;

-- Only counselors can manage solutions
CREATE POLICY "Counselors can manage solutions"
  ON public.counselor_solutions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'counselor'))
  WITH CHECK (public.has_role(auth.uid(), 'counselor'));

-- Allow anon to read reusable solutions (for AI edge function)
CREATE POLICY "Anon can read reusable solutions"
  ON public.counselor_solutions FOR SELECT
  TO anon
  USING (is_reusable = true);

-- Grant select to anon for AI function
GRANT SELECT ON public.counselor_solutions TO anon;

-- Update trigger
CREATE TRIGGER update_counselor_solutions_updated_at
  BEFORE UPDATE ON public.counselor_solutions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
