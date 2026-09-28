export const CITIES = [
  "Madrid",
  "Barcelona",
  "Valencia",
  "Sevilla",
  "Bilbao",
  "Málaga",
  "Zaragoza",
] as const;

export const SPECIALTIES = [
  "Fade / Degradado",
  "Arreglo de barba",
  "Corte a tijera clásico",
  "Coloración",
  "Freestyle / Diseño",
] as const;

export const CONTRACT_TYPES = [
  "Jornada completa",
  "Media jornada",
  "Freelance / Autónomo",
  "Alquiler de sillón",
] as const;

export const AVAILABILITIES = [
  "Inmediata",
  "En 15 días",
  "En 1 mes",
  "Solo fines de semana",
  "Parcial / tardes",
] as const;

export type Specialty = (typeof SPECIALTIES)[number];
export type ContractType = (typeof CONTRACT_TYPES)[number];
export type Availability = (typeof AVAILABILITIES)[number];

export type GalleryItem = {
  id: string;
  type: "image" | "video";
  url: string;
  caption: string;
};

export type Barber = {
  id: string;
  name: string;
  headline: string;
  city: string;
  avatar: string;
  cover: string;
  specialties: Specialty[];
  contractTypes: ContractType[];
  availability: Availability;
  salaryMin: number;
  salaryMax: number;
  experienceYears: number;
  bio: string;
  education: { title: string; school: string; year: string }[];
  email: string;
  whatsapp: string;
  instagram?: string;
  gallery: GalleryItem[];
  featured?: boolean;
};

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const SAMPLE_VIDEO =
  "https://cdn.coverr.co/videos/coverr-a-barber-cutting-hair-4249/1080p.mp4";

export const SEED_BARBERS: Barber[] = [];
