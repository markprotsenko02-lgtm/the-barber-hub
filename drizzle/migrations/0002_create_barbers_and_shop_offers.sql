CREATE TABLE public.barbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  headline text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  avatar text NOT NULL DEFAULT '',
  cover text NOT NULL DEFAULT '',
  specialties text[] NOT NULL DEFAULT '{}',
  contract_types text[] NOT NULL DEFAULT '{}',
  availability text NOT NULL DEFAULT '',
  salary_min integer NOT NULL DEFAULT 0,
  salary_max integer NOT NULL DEFAULT 0,
  experience_years integer NOT NULL DEFAULT 0,
  bio text NOT NULL DEFAULT '',
  education jsonb NOT NULL DEFAULT '[]',
  email text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  instagram text,
  gallery jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.barbers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.barbers TO authenticated;
GRANT ALL ON public.barbers TO service_role;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Portfolios are public" ON public.barbers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users insert own portfolio" ON public.barbers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own portfolio" ON public.barbers FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own portfolio" ON public.barbers FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.shop_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name text NOT NULL,
  looking_for text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  logo text NOT NULL DEFAULT '',
  cover text NOT NULL DEFAULT '',
  specialties text[] NOT NULL DEFAULT '{}',
  contract_type text NOT NULL DEFAULT '',
  salary_min integer NOT NULL DEFAULT 0,
  salary_max integer NOT NULL DEFAULT 0,
  conditions text[] NOT NULL DEFAULT '{}',
  description text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  urgent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.shop_offers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shop_offers TO authenticated;
GRANT ALL ON public.shop_offers TO service_role;
ALTER TABLE public.shop_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Offers are public" ON public.shop_offers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users insert own offer" ON public.shop_offers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own offer" ON public.shop_offers FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own offer" ON public.shop_offers FOR DELETE TO authenticated USING (auth.uid() = user_id);