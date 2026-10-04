CREATE TABLE public.site_visits (
  device_id text NOT NULL,
  day date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (device_id, day)
);
GRANT ALL ON public.site_visits TO service_role;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.track_visit(_device text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF length(_device) < 8 OR length(_device) > 64 THEN RETURN; END IF;
  INSERT INTO public.site_visits(device_id, day) VALUES (_device, current_date) ON CONFLICT DO NOTHING;
END $$;
GRANT EXECUTE ON FUNCTION public.track_visit(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_stats()
RETURNS TABLE(visitors_today bigint, visitors_7d bigint, visitors_total bigint, users_total bigint, portfolios bigint, offers bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT
    (SELECT count(*) FROM public.site_visits WHERE day = current_date),
    (SELECT count(DISTINCT device_id) FROM public.site_visits WHERE day > current_date - 7),
    (SELECT count(DISTINCT device_id) FROM public.site_visits),
    (SELECT count(*) FROM auth.users),
    (SELECT count(*) FROM public.barbers),
    (SELECT count(*) FROM public.shop_offers)
  WHERE public.has_role(auth.uid(), 'admin')
$$;
GRANT EXECUTE ON FUNCTION public.admin_stats() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_stats() FROM anon;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''), COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  IF lower(NEW.email) IN ('markprotsenko02@gmail.com','protsenko123@gmail.com') THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;