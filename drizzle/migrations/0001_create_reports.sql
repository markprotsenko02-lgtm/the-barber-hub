CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reporter_name text NOT NULL,
  reporter_email text NOT NULL,
  target_type text NOT NULL,
  target_id text NOT NULL,
  target_name text NOT NULL,
  target_email text,
  target_whatsapp text,
  reason text NOT NULL,
  details text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create own reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);