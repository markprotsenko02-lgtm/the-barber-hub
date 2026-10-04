CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''), COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  IF lower(NEW.email) = 'markprotsenko02@gmail.com' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $function$;

CREATE TABLE public.contact_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  viewer_id uuid NOT NULL DEFAULT auth.uid(),
  channel text NOT NULL DEFAULT 'whatsapp',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.contact_clicks TO authenticated;
GRANT ALL ON public.contact_clicks TO service_role;
ALTER TABLE public.contact_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users log own clicks" ON public.contact_clicks FOR INSERT TO authenticated
  WITH CHECK (viewer_id = auth.uid() AND target_type IN ('barber','offer') AND channel IN ('whatsapp','email'));
CREATE POLICY "admin reads clicks" ON public.contact_clicks FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL,
  target_id text NOT NULL,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_notes TO authenticated;
GRANT ALL ON public.admin_notes TO service_role;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manages notes" ON public.admin_notes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin updates portfolios" ON public.barbers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin deletes portfolios" ON public.barbers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin updates offers" ON public.shop_offers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin deletes offers" ON public.shop_offers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
GRANT SELECT ON public.reports TO authenticated;
CREATE POLICY "admin reads reports" ON public.reports FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.admin_users()
 RETURNS TABLE(id uuid, email text, first_name text, last_name text, created_at timestamptz, has_portfolio boolean, has_offer boolean)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT u.id, u.email::text, coalesce(p.first_name,''), coalesce(p.last_name,''), u.created_at,
    EXISTS (SELECT 1 FROM public.barbers b WHERE b.user_id = u.id),
    EXISTS (SELECT 1 FROM public.shop_offers o WHERE o.user_id = u.id)
  FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id
  WHERE public.has_role(auth.uid(), 'admin')
  ORDER BY u.created_at DESC
$$;
REVOKE EXECUTE ON FUNCTION public.admin_users() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.admin_users() TO authenticated;