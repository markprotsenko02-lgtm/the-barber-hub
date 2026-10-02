CREATE POLICY "portfolio read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'portfolio');
CREATE POLICY "portfolio own upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "portfolio own delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE TABLE public.profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  viewer_id uuid NOT NULL DEFAULT auth.uid(),
  viewer_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.profile_views TO authenticated;
GRANT ALL ON public.profile_views TO service_role;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "viewer inserts own view" ON public.profile_views FOR INSERT TO authenticated
  WITH CHECK (viewer_id = auth.uid() AND owner_id <> auth.uid()
    AND EXISTS (SELECT 1 FROM public.barbers b WHERE b.id = barber_id AND b.user_id = owner_id));
CREATE POLICY "owner reads views" ON public.profile_views FOR SELECT TO authenticated USING (owner_id = auth.uid());
ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_views;