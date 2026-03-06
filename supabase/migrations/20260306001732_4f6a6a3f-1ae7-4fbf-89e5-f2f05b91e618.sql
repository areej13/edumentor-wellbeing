
-- Create reports table
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL DEFAULT 'student',
  education_level text,
  category text NOT NULL,
  emotion text,
  report_text text NOT NULL,
  status text NOT NULL DEFAULT 'جديد',
  ai_recommendations text[],
  ai_category_suggestion text,
  ai_emotion_detected text,
  counselor_notes text,
  counselor_recommendation text,
  counselor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Anyone can insert reports (anonymous reporting)
CREATE POLICY "Anyone can submit reports"
  ON public.reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only counselors can view reports
CREATE POLICY "Counselors can view all reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'counselor'));

-- Only counselors can update reports
CREATE POLICY "Counselors can update reports"
  ON public.reports FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'counselor'));

-- Update trigger
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
