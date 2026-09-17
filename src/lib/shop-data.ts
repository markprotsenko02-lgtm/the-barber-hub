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

export const SEED_OFFERS: ShopOffer[] = [
  {
    id: "the-iron-comb",
    shopName: "The Iron Comb",
    city: "Madrid",
    logo: img("1521490683712-35a1cb61fa6d", 300),
    cover: img("1585747860715-2ba37e788b70"),
    lookingFor: "Barbero senior con dominio del degradado",
    specialties: ["Fade / Degradado", "Arreglo de barba"],
    contractType: "Jornada completa",
    salaryMin: 1900,
    salaryMax: 2500,
    conditions: [
      "Fijo + 15% de comisión",
      "2 días libres seguidos",
      "Formación mensual pagada",
      "Herramienta profesional incluida",
    ],
    description:
      "Barbería de referencia en Chamberí con 4 sillones y agenda llena. Buscamos alguien rápido, limpio y con buen trato con el cliente para el turno de tarde.",
    email: "equipo@theironcomb.es",
    whatsapp: "34611000111",
    urgent: true,
  },
  {
    id: "casa-navaja",
    shopName: "Casa Navaja",
    city: "Bilbao",
    logo: img("1517832606299-7ae9b720a186", 300),
    cover: img("1503951914875-452162b0f3f1"),
    lookingFor: "Barbero clásico para afeitados a navaja",
    specialties: ["Corte a tijera clásico", "Arreglo de barba"],
    contractType: "Media jornada",
    salaryMin: 1100,
    salaryMax: 1400,
    conditions: [
      "Turnos de mañana",
      "Ritual clásico y producto premium",
      "Clientela fiel de barrio",
    ],
    description:
      "Barbería tradicional en el Casco Viejo. Valoramos la tijera sobre peine y el afeitado clásico por encima de la velocidad.",
    email: "hola@casanavaja.es",
    whatsapp: "34611222333",
  },
  {
    id: "district-fade",
    shopName: "District Fade",
    city: "Barcelona",
    logo: img("1596728325488-58c87691e9af", 300),
    cover: img("1622286342621-4bd786c2447c"),
    lookingFor: "Barbero joven con ganas de aprender fade avanzado",
    specialties: ["Fade / Degradado", "Freestyle / Diseño"],
    contractType: "Jornada completa",
    salaryMin: 1500,
    salaryMax: 2100,
    conditions: [
      "Mentoría del equipo senior",
      "Contenido para redes producido por la barbería",
      "Bonus por reseñas 5 estrellas",
    ],
    description:
      "Somos un equipo de 6 barberos en Poblenou muy activos en redes. Si vienes con actitud, te formamos en degradado y diseño.",
    email: "jobs@districtfade.com",
    whatsapp: "34611444555",
  },
  {
    id: "atelier-cesar",
    shopName: "Atelier César",
    city: "Valencia",
    logo: img("1605497788044-5a32c7078486", 300),
    cover: img("1560066984-138dadb4c035"),
    lookingFor: "Colorista para servicios de color masculino",
    specialties: ["Coloración", "Fade / Degradado"],
    contractType: "Freelance / Autónomo",
    salaryMin: 1300,
    salaryMax: 2800,
    conditions: [
      "50% del servicio de color",
      "Agenda propia y horario flexible",
      "Producto profesional incluido",
    ],
    description:
      "Queremos abrir carta de color en Ruzafa. Buscamos alguien autónomo con cartera propia y buen criterio técnico.",
    email: "cesar@ateliercesar.es",
    whatsapp: "34611666777",
  },
  {
    id: "barberia-sur",
    shopName: "Barbería Sur",
    city: "Sevilla",
    logo: img("1621605815971-fbc98d665033", 300),
    cover: img("1614281477758-e07db3f8bcae"),
    lookingFor: "Sillón libre para barbero con clientela",
    specialties: ["Fade / Degradado", "Corte a tijera clásico"],
    contractType: "Alquiler de sillón",
    salaryMin: 350,
    salaryMax: 450,
    conditions: [
      "Alquiler mensual todo incluido",
      "Recepción y reservas gestionadas",
      "Zona de mucho paso en Triana",
    ],
    description:
      "Cedemos un sillón en una barbería con mucha visibilidad. Ideal para quien ya tiene clientes y quiere independencia.",
    email: "info@barberiasur.es",
    whatsapp: "34611888999",
    urgent: true,
  },
  {
    id: "golden-blade",
    shopName: "Golden Blade Club",
    city: "Málaga",
    logo: img("1580618672591-eb180b1a973f", 300),
    cover: img("1599351431202-1e0f0137899a"),
    lookingFor: "Barbero de fin de semana para temporada alta",
    specialties: ["Fade / Degradado", "Freestyle / Diseño"],
    contractType: "Media jornada",
    salaryMin: 900,
    salaryMax: 1300,
    conditions: [
      "Viernes a domingo",
      "Propinas íntegras",
      "Alojamiento ayudado en temporada",
    ],
    description:
      "Club de barbería en el centro con clientela internacional. Necesitamos refuerzo para fines de semana de temporada alta.",
    email: "team@goldenbladeclub.com",
    whatsapp: "34612000111",
  },
];
