import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";
import type { Barber, GalleryItem, Specialty, ContractType, Availability } from "./barber-data";
import type { ShopOffer } from "./shop-data";
import {
  createBarber,
  createOffer,
  getMyBarber,
  listBarbers,
  listOffers,
  updateBarber as updateBarberFn,
} from "./directory.functions";

export function mapBarber(r: Tables<"barbers">): Barber {
  return {
    id: r.id,
    name: r.name,
    headline: r.headline,
    city: r.city,
    avatar: r.avatar,
    cover: r.cover,
    specialties: r.specialties as Specialty[],
    contractTypes: r.contract_types as ContractType[],
    availability: r.availability as Availability,
    salaryMin: r.salary_min,
    salaryMax: r.salary_max,
    experienceYears: r.experience_years,
    bio: r.bio,
    education: (r.education as Barber["education"]) ?? [],
    email: r.email,
    whatsapp: r.whatsapp,
    ...(r.instagram ? { instagram: r.instagram } : {}),
    gallery: (r.gallery as GalleryItem[]) ?? [],
  };
}

export function mapOffer(r: Tables<"shop_offers">): ShopOffer {
  return {
    id: r.id,
    shopName: r.shop_name,
    city: r.city,
    logo: r.logo,
    cover: r.cover,
    lookingFor: r.looking_for,
    specialties: r.specialties as Specialty[],
    contractType: r.contract_type as ContractType,
    salaryMin: r.salary_min,
    salaryMax: r.salary_max,
    conditions: r.conditions,
    description: r.description,
    email: r.email,
    whatsapp: r.whatsapp,
    ...(r.urgent ? { urgent: true } : {}),
  };
}

export type BarberInput = Omit<Barber, "id">;
export type OfferInput = Omit<ShopOffer, "id">;

type Ctx = {
  barbers: Barber[];
  offers: ShopOffer[];
  isLoading: boolean;
  addBarber: (input: BarberInput) => Promise<Barber>;
  updateBarber: (id: string, patch: Partial<BarberInput>) => Promise<void>;
  addGalleryItem: (id: string, item: Omit<GalleryItem, "id">) => Promise<void>;
  removeGalleryItem: (id: string, itemId: string) => Promise<void>;
  addOffer: (input: OfferInput) => Promise<void>;
};

export function useBarbers(): Ctx {
  const qc = useQueryClient();
  const barbersQ = useQuery({
    queryKey: ["barbers"],
    queryFn: async () => (await listBarbers()).map(mapBarber),
  });
  const offersQ = useQuery({
    queryKey: ["offers"],
    queryFn: async () => (await listOffers()).map(mapOffer),
  });

  const invalidate = React.useCallback(
    () => qc.invalidateQueries({ queryKey: ["barbers"] }),
    [qc],
  );

  return {
    barbers: barbersQ.data ?? [],
    offers: offersQ.data ?? [],
    isLoading: barbersQ.isLoading || offersQ.isLoading,
    addBarber: async (input) => {
      const row = await createBarber({ data: input });
      await invalidate();
      return mapBarber(row);
    },
    updateBarber: async (id, patch) => {
      await updateBarberFn({ data: { id, patch } });
      await invalidate();
    },
    addGalleryItem: async (id, item) => {
      const barber = (barbersQ.data ?? []).find((b) => b.id === id);
      if (!barber) return;
      const gallery: GalleryItem[] = [
        { ...item, id: `g-${Date.now().toString(36)}` },
        ...barber.gallery,
      ];
      await updateBarberFn({ data: { id, patch: { gallery } } });
      await invalidate();
    },
    removeGalleryItem: async (id, itemId) => {
      const barber = (barbersQ.data ?? []).find((b) => b.id === id);
      if (!barber) return;
      const gallery = barber.gallery.filter((g) => g.id !== itemId);
      await updateBarberFn({ data: { id, patch: { gallery } } });
      await invalidate();
    },
    addOffer: async (input) => {
      await createOffer({ data: input });
      await qc.invalidateQueries({ queryKey: ["offers"] });
    },
  };
}

export function useMyBarber(enabled: boolean) {
  return useQuery({
    queryKey: ["my-barber"],
    enabled,
    queryFn: async () => {
      const row = await getMyBarber();
      return row ? mapBarber(row) : null;
    },
  });
}
