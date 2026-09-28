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
