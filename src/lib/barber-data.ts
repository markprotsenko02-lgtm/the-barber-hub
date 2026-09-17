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

export const SEED_BARBERS: Barber[] = [
  {
    id: "nico-ramos",
    name: "Nico Ramos",
    headline: "Especialista en fades quirúrgicos y diseño freestyle",
    city: "Madrid",
    avatar: img("1503443207922-dff7d543fd0e", 400),
    cover: img("1621605815971-fbc98d665033"),
    specialties: ["Fade / Degradado", "Freestyle / Diseño"],
    contractTypes: ["Jornada completa", "Alquiler de sillón"],
    availability: "Inmediata",
    salaryMin: 1800,
    salaryMax: 2400,
    experienceYears: 9,
    bio: "Nueve años detrás del sillón, los últimos cuatro en una barbería de referencia en Malasaña. Trabajo el degradado a máquina con acabado a navaja y me apasiona el diseño freestyle sobre el cuero cabelludo. Busco un equipo con ambición y clientela fiel.",
    education: [
      { title: "Máster en Barbería Clásica", school: "The Barber Academy Madrid", year: "2019" },
      { title: "Certificación Fade Avanzado", school: "Andis Education Team", year: "2022" },
      { title: "Taller de Diseño Freestyle", school: "Hair Tattoo Lab BCN", year: "2023" },
    ],
    email: "nico.ramos@barbermatch.es",
    whatsapp: "34600111222",
    instagram: "@nico.fades",
    gallery: [
      { id: "g1", type: "image", url: img("1621605815971-fbc98d665033"), caption: "Mid fade con textura" },
      { id: "g2", type: "image", url: img("1599351431202-1e0f0137899a"), caption: "Skin fade + línea marcada" },
      { id: "g3", type: "image", url: img("1580618672591-eb180b1a973f"), caption: "Diseño freestyle a navaja" },
      { id: "g4", type: "image", url: img("1587909209111-5097ee578ec3"), caption: "Perfilado y acabado" },
      { id: "g5", type: "video", url: SAMPLE_VIDEO, caption: "Proceso de degradado en vídeo" },
    ],
    featured: true,
  },
  {
    id: "aitor-vega",
    name: "Aitor Vega",
    headline: "Barbero clásico: tijera, navaja y toalla caliente",
    city: "Bilbao",
    avatar: img("1500648767791-00dcc994a43e", 400),
    cover: img("1585747860715-2ba37e788b70"),
    specialties: ["Corte a tijera clásico", "Arreglo de barba"],
    contractTypes: ["Jornada completa", "Media jornada"],
    availability: "En 15 días",
    salaryMin: 1600,
    salaryMax: 2000,
    experienceYears: 12,
    bio: "Formado a la vieja escuela en una barbería familiar del Casco Viejo. Tijera sobre peine, afeitado a navaja y ritual de toalla caliente. Me gusta cuidar la conversación tanto como el corte.",
    education: [
      { title: "Barbería Tradicional Nivel III", school: "Escuela Bilbao Barber Club", year: "2014" },
      { title: "Afeitado clásico a navaja", school: "American Crew Academy", year: "2018" },
    ],
    email: "aitor.vega@barbermatch.es",
    whatsapp: "34600333444",
    instagram: "@aitor.classiccuts",
    gallery: [
      { id: "g1", type: "image", url: img("1585747860715-2ba37e788b70"), caption: "Corte clásico a tijera" },
      { id: "g2", type: "image", url: img("1622286342621-4bd786c2447c"), caption: "Barba perfilada" },
      { id: "g3", type: "image", url: img("1503951914875-452162b0f3f1"), caption: "Afeitado a navaja" },
      { id: "g4", type: "image", url: img("1517832606299-7ae9b720a186"), caption: "Peinado con raya lateral" },
    ],
    featured: true,
  },
  {
    id: "leyre-santos",
    name: "Leyre Santos",
    headline: "Color y decoloración avanzada para hombre",
    city: "Barcelona",
    avatar: img("1544005313-94ddf0286df2", 400),
    cover: img("1560066984-138dadb4c035"),
    specialties: ["Coloración", "Fade / Degradado"],
    contractTypes: ["Freelance / Autónomo", "Media jornada"],
    availability: "Parcial / tardes",
    salaryMin: 1400,
    salaryMax: 2600,
    experienceYears: 7,
    bio: "Colorista especializada en platinos, tonos fantasía y bloques de color sobre degradados. Trabajo por proyectos y colaboro con barberías que quieran ampliar su carta de servicios de color.",
    education: [
      { title: "Especialista en Color Técnico", school: "Wella Studio Barcelona", year: "2020" },
      { title: "Decoloración segura y cuidado capilar", school: "Olaplex Pro Education", year: "2022" },
    ],
    email: "leyre.santos@barbermatch.es",
    whatsapp: "34600555666",
    instagram: "@leyre.color",
    gallery: [
      { id: "g1", type: "image", url: img("1560066984-138dadb4c035"), caption: "Platino con raíz difuminada" },
      { id: "g2", type: "image", url: img("1595475884562-073c30d45670"), caption: "Bloque de color sobre fade" },
      { id: "g3", type: "image", url: img("1519345182560-3f2917c472ef"), caption: "Tono ceniza" },
      { id: "g4", type: "image", url: img("1596728325488-58c87691e9af"), caption: "Trabajo de mechas" },
    ],
  },
  {
    id: "omar-el-fassi",
    name: "Omar El Fassi",
    headline: "Barbas de autor y perfilados milimétricos",
    city: "Valencia",
    avatar: img("1519085360753-af0119f7cbe7", 400),
    cover: img("1596728325488-58c87691e9af"),
    specialties: ["Arreglo de barba", "Fade / Degradado"],
    contractTypes: ["Alquiler de sillón", "Freelance / Autónomo"],
    availability: "Inmediata",
    salaryMin: 1500,
    salaryMax: 2200,
    experienceYears: 6,
    bio: "Me obsesiona la simetría: perfilo barbas con plantilla mental y navaja fina. Vengo de una barbería de alto volumen en Ruzafa y busco un sillón donde construir mi propia cartera de clientes.",
    education: [
      { title: "Beard Design Masterclass", school: "Barber Shop Valencia Lab", year: "2021" },
      { title: "Higiene y afeitado profesional", school: "Proraso Academy", year: "2020" },
    ],
    email: "omar.elfassi@barbermatch.es",
    whatsapp: "34600777888",
    instagram: "@omar.beardlines",
    gallery: [
      { id: "g1", type: "image", url: img("1596728325488-58c87691e9af"), caption: "Barba completa perfilada" },
      { id: "g2", type: "image", url: img("1621607512022-6aecc4fed814"), caption: "Fade + barba corta" },
      { id: "g3", type: "image", url: img("1605497788044-5a32c7078486"), caption: "Detalle de contorno" },
      { id: "g4", type: "video", url: SAMPLE_VIDEO, caption: "Perfilado en directo" },
    ],
  },
  {
    id: "dani-quiroga",
    name: "Dani Quiroga",
    headline: "Cortes urbanos, texturas y taper fade",
    city: "Sevilla",
    avatar: img("1492562080023-ab3db95bfbce", 400),
    cover: img("1622286342621-4bd786c2447c"),
    specialties: ["Fade / Degradado", "Corte a tijera clásico"],
    contractTypes: ["Media jornada", "Jornada completa"],
    availability: "En 1 mes",
    salaryMin: 1300,
    salaryMax: 1800,
    experienceYears: 4,
    bio: "Rápido, limpio y muy centrado en texturas modernas. Cuatro años en barberías con mucha rotación me han dado velocidad sin perder acabado. Busco estabilidad y formación continua.",
    education: [
      { title: "Curso Superior de Barbería", school: "Academia Sevilla Barber", year: "2022" },
      { title: "Texturizado y styling masculino", school: "Uppercut Deluxe Workshop", year: "2024" },
    ],
    email: "dani.quiroga@barbermatch.es",
    whatsapp: "34600999000",
    instagram: "@dani.taper",
    gallery: [
      { id: "g1", type: "image", url: img("1622286342621-4bd786c2447c"), caption: "Taper fade texturizado" },
      { id: "g2", type: "image", url: img("1614281477758-e07db3f8bcae"), caption: "Crop francés" },
      { id: "g3", type: "image", url: img("1517832606299-7ae9b720a186"), caption: "Acabado con cera mate" },
    ],
  },
  {
    id: "samu-iriarte",
    name: "Samu Iriarte",
    headline: "Freestyle, hair tattoo y competición",
    city: "Málaga",
    avatar: img("1534528741775-53994a69daeb", 400),
    cover: img("1580618672591-eb180b1a973f"),
    specialties: ["Freestyle / Diseño", "Fade / Degradado", "Coloración"],
    contractTypes: ["Alquiler de sillón"],
    availability: "Solo fines de semana",
    salaryMin: 1200,
    salaryMax: 3000,
    experienceYears: 10,
    bio: "Compito en campeonatos de hair tattoo desde 2018 y doy formaciones los lunes. Busco un sillón en Málaga centro para viernes, sábado y domingo con clientela de diseño.",
    education: [
      { title: "Campeón regional Hair Tattoo", school: "Andalucía Barber Battle", year: "2023" },
      { title: "Formador oficial de freestyle", school: "BaByliss Pro Team", year: "2024" },
    ],
    email: "samu.iriarte@barbermatch.es",
    whatsapp: "34601222333",
    instagram: "@samu.freestyle",
    gallery: [
      { id: "g1", type: "image", url: img("1580618672591-eb180b1a973f"), caption: "Diseño geométrico" },
      { id: "g2", type: "image", url: img("1599351431202-1e0f0137899a"), caption: "Líneas y degradado" },
      { id: "g3", type: "image", url: img("1605497788044-5a32c7078486"), caption: "Freestyle con color" },
      { id: "g4", type: "video", url: SAMPLE_VIDEO, caption: "Trabajo de competición" },
    ],
    featured: true,
  },
];
