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
  email: z.string().trim().email().max(255),
  whatsapp: z.string().trim().max(15),
  instagram: z.string().max(60).optional(),
  gallery: z.array(galleryItemSchema).max(30),
});

const offerInputSchema = z.object({
  shopName: z.string().trim().min(2).max(80),
  lookingFor: z.string().trim().max(120),
  city: z.string().trim().max(60),
  logo: z.string().max(500),
  cover: z.string().max(500),
  specialties: z.array(z.string()).max(10),
  contractType: z.string().max(60),
  salaryMin: z.number().int().min(0).max(9000),
  salaryMax: z.number().int().min(0).max(9000),
  conditions: z.array(z.string().max(120)).max(10),
  description: z.string().max(800),
  email: z.string().trim().email().max(255),
  whatsapp: z.string().trim().max(15),
  urgent: z.boolean().optional(),
});

export const listBarbers = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("barbers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listOffers = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("shop_offers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
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
    const update: Database["public"]["Tables"]["barbers"]["Update"] = {};
    if (p.name !== undefined) update["name"] = p.name;
    if (p.headline !== undefined) update["headline"] = p.headline;
    if (p.city !== undefined) update["city"] = p.city;
    if (p.avatar !== undefined) update["avatar"] = p.avatar;
    if (p.cover !== undefined) update["cover"] = p.cover;
    if (p.specialties !== undefined) update["specialties"] = p.specialties;
    if (p.contractTypes !== undefined) update["contract_types"] = p.contractTypes;
    if (p.availability !== undefined) update["availability"] = p.availability;
    if (p.salaryMin !== undefined) update["salary_min"] = p.salaryMin;
    if (p.salaryMax !== undefined) update["salary_max"] = p.salaryMax;
    if (p.experienceYears !== undefined) update["experience_years"] = p.experienceYears;
    if (p.bio !== undefined) update["bio"] = p.bio;
    if (p.education !== undefined) update["education"] = p.education;
    if (p.email !== undefined) update["email"] = p.email;
    if (p.whatsapp !== undefined) update["whatsapp"] = p.whatsapp;
    if (p.instagram !== undefined) update["instagram"] = p.instagram ?? null;
    if (p.gallery !== undefined) update["gallery"] = p.gallery;
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
