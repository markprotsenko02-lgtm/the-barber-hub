CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role public.app_role NOT NULL, UNIQUE(user_id, role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;

CREATE TABLE public.draft_tracking (device_id text NOT NULL, kind text NOT NULL, published boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (device_id, kind));
GRANT ALL ON public.draft_tracking TO service_role;
ALTER TABLE public.draft_tracking ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.track_draft(_device text, _kind text, _published boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _kind NOT IN ('portfolio','offer') OR length(_device) < 8 OR length(_device) > 64 THEN RETURN; END IF;
  INSERT INTO public.draft_tracking(device_id, kind, published) VALUES (_device, _kind, _published)
  ON CONFLICT (device_id, kind) DO UPDATE SET published = draft_tracking.published OR EXCLUDED.published, updated_at = now();
END $$;
GRANT EXECUTE ON FUNCTION public.track_draft(text,text,boolean) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.draft_stats() RETURNS TABLE(kind text, started bigint, published bigint, pending bigint) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT d.kind, count(*), count(*) FILTER (WHERE d.published), count(*) FILTER (WHERE NOT d.published)
  FROM public.draft_tracking d WHERE public.has_role(auth.uid(), 'admin') GROUP BY d.kind
$$;
GRANT EXECUTE ON FUNCTION public.draft_stats() TO authenticated;

INSERT INTO public.user_roles(user_id, role) SELECT id, 'admin' FROM public.profiles WHERE email ILIKE 'markprotsenko02%' OR email ILIKE 'protsenko123%' ON CONFLICT DO NOTHING;