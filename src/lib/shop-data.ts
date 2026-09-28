import type { ContractType, Specialty } from "./barber-data";

export type ShopOffer = {
  id: string;
  shopName: string;
  city: string;
  logo: string;
  cover: string;
  lookingFor: string;
  specialties: Specialty[];
  contractType: ContractType;
  salaryMin: number;
  salaryMax: number;
  conditions: string[];
  description: string;
  email: string;
  whatsapp: string;
  urgent?: boolean;
};

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const SEED_OFFERS: ShopOffer[] = [];
