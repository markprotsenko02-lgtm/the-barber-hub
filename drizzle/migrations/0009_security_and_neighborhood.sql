ALTER TABLE public.barbers ADD COLUMN IF NOT EXISTS neighborhood text NOT NULL DEFAULT '';
ALTER TABLE public.shop_offers ADD COLUMN IF NOT EXISTS neighborhood text NOT NULL DEFAULT '';
REVOKE SELECT ON public.barbers FROM anon;
REVOKE SELECT ON public.shop_offers FROM anon;
GRANT SELECT (id,user_id,name,headline,city,neighborhood,avatar,cover,specialties,contract_types,availability,salary_min,salary_max,experience_years,bio,education,whatsapp,instagram,gallery,created_at) ON public.barbers TO anon;
GRANT SELECT (id,user_id,shop_name,looking_for,city,neighborhood,logo,cover,specialties,contract_type,salary_min,salary_max,conditions,description,whatsapp,urgent,created_at) ON public.shop_offers TO anon;
DROP POLICY IF EXISTS "portfolio read" ON storage.objects;
CREATE POLICY "portfolio owner read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'portfolio' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')));