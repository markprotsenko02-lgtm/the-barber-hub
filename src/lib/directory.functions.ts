import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const galleryItemSchema = z.object({
  id: z.string(),
  type: z.enum(["image", "video"]),
  url: z.string().url().max(500),
  caption: z.string().max(120),
});

const educationSchema = z.object({
  title: z.string().max(90),
  school: z.string().max(90),
  year: z.string().max(10),
});

const barberInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  headline: z.string().trim().max(120),
  city: z.string().trim().max(60),
  neighborhood: z.string().trim().max(60).optional(),
  avatar: z.string().max(500),
  cover: z.string().max(500),
  specialties: z.array(z.string()).max(10),
  contractTypes: z.array(z.string()).max(10),
  availability: z.string().max(60),
  salaryMin: z.number().int().min(0).max(9000),
  salaryMax: z.number().int().min(0).max(9000),
  experienceYears: z.number().int().min(0).max(60),
  bio: z.string().max(800),
  education: z.array(educationSchema).max(10),
  email: z.union([z.literal(""), z.string().trim().email().max(255)]),
  whatsapp: z.string().trim().max(15),
  instagram: z.string().max(60).optional(),
  gallery: z.array(galleryItemSchema).max(30),
});

const offerInputSchema = z.object({
  shopName: z.string().trim().min(2).max(80),
  lookingFor: z.string().trim().max(120),
  city: z.string().trim().max(60),
  neighborhood: z.string().trim().max(60).optional(),
  logo: z.string().max(500),
  cover: z.string().max(500),
  specialties: z.array(z.string()).max(10),
  contractType: z.string().max(60),
  salaryMin: z.number().int().min(0).max(9000),
  salaryMax: z.number().int().min(0).max(9000),
  conditions: z.array(z.string().max(120)).max(10),
  description: z.string().max(800),
  email: z.union([z.literal(""), z.string().trim().email().max(255)]),
  whatsapp: z.string().trim().max(15),
  urgent: z.boolean().optional(),
});

const BARBER_COLS = "id,user_id,name,headline,city,neighborhood,avatar,cover,specialties,contract_types,availability,salary_min,salary_max,experience_years,bio,education,whatsapp,instagram,gallery,created_at";
const OFFER_COLS = "id,user_id,shop_name,looking_for,city,neighborhood,logo,cover,specialties,contract_type,salary_min,salary_max,conditions,description,whatsapp,urgent,created_at";

export const listBarbers = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("barbers")
    .select(BARBER_COLS)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({ ...r, email: "" }));
});

export const listOffers = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("shop_offers")
    .select(OFFER_COLS)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({ ...r, email: "" }));
});

export const getMyBarber = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("barbers")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const createBarber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => barberInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("barbers")
      .insert({
        user_id: context.userId,
        name: data.name,
        headline: data.headline,
        city: data.city,
        neighborhood: data.neighborhood ?? "",
        avatar: data.avatar,
        cover: data.cover,
        specialties: data.specialties,
        contract_types: data.contractTypes,
        availability: data.availability,
        salary_min: data.salaryMin,
        salary_max: data.salaryMax,
        experience_years: data.experienceYears,
        bio: data.bio,
        education: data.education,
        email: data.email,
        whatsapp: data.whatsapp,
        instagram: data.instagram ?? null,
        gallery: data.gallery,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateBarber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), patch: barberInputSchema.partial() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const p = data.patch;
    const update = {
      ...(p.name !== undefined && { name: p.name }),
      ...(p.headline !== undefined && { headline: p.headline }),
      ...(p.city !== undefined && { city: p.city }),
      ...(p.neighborhood !== undefined && { neighborhood: p.neighborhood }),
      ...(p.avatar !== undefined && { avatar: p.avatar }),
      ...(p.cover !== undefined && { cover: p.cover }),
      ...(p.specialties !== undefined && { specialties: p.specialties }),
      ...(p.contractTypes !== undefined && { contract_types: p.contractTypes }),
      ...(p.availability !== undefined && { availability: p.availability }),
      ...(p.salaryMin !== undefined && { salary_min: p.salaryMin }),
      ...(p.salaryMax !== undefined && { salary_max: p.salaryMax }),
      ...(p.experienceYears !== undefined && { experience_years: p.experienceYears }),
      ...(p.bio !== undefined && { bio: p.bio }),
      ...(p.education !== undefined && { education: p.education }),
      ...(p.email !== undefined && { email: p.email }),
      ...(p.whatsapp !== undefined && { whatsapp: p.whatsapp }),
      ...(p.instagram !== undefined && { instagram: p.instagram ?? null }),
      ...(p.gallery !== undefined && { gallery: p.gallery }),
    } satisfies Database["public"]["Tables"]["barbers"]["Update"];
    const { error } = await context.supabase
      .from("barbers")
      .update(update)
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => offerInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("shop_offers")
      .insert({
        user_id: context.userId,
        shop_name: data.shopName,
        looking_for: data.lookingFor,
        city: data.city,
        neighborhood: data.neighborhood ?? "",
        logo: data.logo,
        cover: data.cover,
        specialties: data.specialties,
        contract_type: data.contractType,
        salary_min: data.salaryMin,
        salary_max: data.salaryMax,
        conditions: data.conditions,
        description: data.description,
        email: data.email,
        whatsapp: data.whatsapp,
        urgent: data.urgent ?? false,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const getBarberSeo = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { data: row } = await publicClient()
      .from("barbers")
      .select("name, headline, city, experience_years, cover, avatar")
      .eq("id", data.id)
      .maybeSingle();
    return row ?? null;
  });
