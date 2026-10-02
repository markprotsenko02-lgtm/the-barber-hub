ALTER TABLE public.profile_views ALTER COLUMN owner_id SET DEFAULT gen_random_uuid();
CREATE OR REPLACE FUNCTION public.set_profile_view_owner() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  SELECT user_id INTO NEW.owner_id FROM public.barbers WHERE id = NEW.barber_id;
  NEW.viewer_id := auth.uid();
  RETURN NEW;
END $$;
CREATE TRIGGER profile_views_set_owner BEFORE INSERT ON public.profile_views FOR EACH ROW EXECUTE FUNCTION public.set_profile_view_owner();