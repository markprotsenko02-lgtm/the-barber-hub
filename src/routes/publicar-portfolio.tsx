import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import {
  AVAILABILITIES,
  CITIES,
  CONTRACT_TYPES,
  SPECIALTIES,
  type Availability,
  type ContractType,
  type GalleryItem,
  type Specialty,
} from "@/lib/barber-data";
import { useBarbers } from "@/lib/barber-store";
import { TipsPanel } from "@/components/tips-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/publicar-portfolio")({
  head: () => ({
    meta: [
      { title: "Publicar mi portfolio de barbero — BarberHub" },
      {
        name: "description",
        content:
          "Consejos para un portfolio de éxito y formulario guiado para publicar tus fotos, vídeos, especialidades, formación y expectativas laborales.",
      },
      { property: "og:title", content: "Publicar mi portfolio de barbero — BarberHub" },
      {
        property: "og:description",
        content: "Muestra tus mejores cortes y deja claras tus condiciones laborales.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PublishPortfolio,
});

const schema = z.object({
  name: z.string().trim().min(2, "Indica tu nombre").max(80),
  headline: z.string().trim().min(5, "Escribe un titular corto").max(120),
  bio: z.string().trim().min(20, "Cuéntanos algo más sobre ti").max(800),
  experienceYears: z.number().min(1, "Indica tus años de experiencia").max(60),
  salaryMin: z.number().min(1, "Indica tu salario esperado").max(9000),
  salaryMax: z.number().min(1, "Indica tu salario esperado").max(9000),
  email: z.string().trim().email("Email no válido").max(255),
  whatsapp: z.string().trim().regex(/^\d{9,15}$/, "Solo números, con prefijo del país"),
});

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1503443207922-dff7d543fd0e?auto=format&fit=crop&w=300&q=80";
const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80";

const TIPS = [
  {
    title: "Fotos y vídeos nítidos",
    text: "Sube trabajos de fade y barba con buena luz, fondo limpio y enfoque en el detalle del degradado.",
  },
  {
    title: "Especifica tus especialidades",
    text: "Marca solo lo que dominas de verdad: fade, tijera clásica, barba, coloración o diseño freestyle.",
  },
  {
    title: "Detalla formación y cursos",
    text: "Añade academias, másters y cursos realizados con año y centro: da confianza a la barbería.",
  },
  {
    title: "Disponibilidad real",
    text: "Indica cuándo puedes empezar de verdad y si buscas jornada completa, parcial, autónomo o silla.",
  },
  {
    title: "Rango salarial claro",
    text: "Un rango honesto evita perder tiempo en entrevistas que no encajan con tus expectativas.",
  },
  {
    title: "Contacto directo",
    text: "Email y WhatsApp correctos con prefijo del país para que te escriban en el momento.",
  },
];

function PublishPortfolio() {
  const { addBarber } = useBarbers();
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    name: "",
    headline: "",
    bio: "",
    city: CITIES[0] as string,
    availability: AVAILABILITIES[0] as Availability,
    experienceYears: "",
    salaryMin: "",
    salaryMax: "",
    email: "",
    whatsapp: "",
    instagram: "",
    education: "",
  });
  const [specialties, setSpecialties] = React.useState<Specialty[]>([]);
  const [contracts, setContracts] = React.useState<ContractType[]>([]);
  const [gallery, setGallery] = React.useState<GalleryItem[]>([]);
  const [media, setMedia] = React.useState({
    type: "image" as "image" | "video",
    url: "",
    caption: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const addMedia = () => {
    if (!/^https?:\/\//.test(media.url.trim())) {
      toast.error("Pega una URL válida de la foto o el vídeo");
      return;
    }
    setGallery((g) => [
      {
        id: `g-${Date.now().toString(36)}`,
        type: media.type,
        url: media.url.trim(),
        caption: media.caption.trim() || "Trabajo",
      },
      ...g,
    ]);
    setMedia({ type: media.type, url: "", caption: "" });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      ...form,
      experienceYears: Number(form.experienceYears) || 0,
      salaryMin: Number(form.salaryMin) || 0,
      salaryMax: Number(form.salaryMax) || 0,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    if (specialties.length === 0) {
      setErrors({ specialties: "Elige al menos una especialidad" });
      return;
    }
    if (contracts.length === 0) {
      setErrors({ contracts: "Elige al menos un tipo de contrato" });
      return;
    }
    if (gallery.length === 0) {
      setErrors({ gallery: "Añade al menos una foto o vídeo de tu trabajo" });
      return;
    }
    setErrors({});

    const id = `barber-${Date.now().toString(36)}`;
    const firstImage = gallery.find((g) => g.type === "image");
    addBarber({
      id,
      name: parsed.data.name,
      headline: parsed.data.headline,
      city: form.city,
      avatar: DEFAULT_AVATAR,
      cover: firstImage?.url ?? DEFAULT_COVER,
      specialties,
      contractTypes: contracts,
      availability: form.availability,
      salaryMin: parsed.data.salaryMin,
      salaryMax: parsed.data.salaryMax,
      experienceYears: parsed.data.experienceYears,
      bio: parsed.data.bio,
      education: form.education
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 6)
        .map((line) => {
          const [title, school, year] = line.split("|").map((p) => p.trim());
          return { title: title ?? line, school: school ?? "", year: year ?? "" };
        }),
      email: parsed.data.email,
      whatsapp: parsed.data.whatsapp,
      ...(form.instagram.trim() ? { instagram: form.instagram.trim() } : {}),
      gallery,
    });
    toast.success("Portfolio publicado", {
      description: "Ya apareces en el muro de barberos.",
    });
    navigate({ to: "/barberos/$barberId", params: { barberId: id } });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Button asChild size="sm" variant="ghost" className="-ml-2 mb-2 text-muted-foreground">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" /> Volver al muro
        </Link>
      </Button>
      <h1 className="font-display text-3xl font-semibold uppercase">Publicar mi portfolio</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Primero los consejos, después el formulario guiado. Se publica al instante.
      </p>

      <div className="mt-6">
        <TipsPanel
          title="Recomendaciones para un portfolio de éxito"
          intro="Los portfolios que reciben más contactos cumplen estos puntos antes de publicarse."
          tips={TIPS}
        />
      </div>

      <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
        <div className="grid gap-4 rounded-xl border border-border/70 bg-card p-4 sm:grid-cols-2">
          <Field label="Nombre y apellido" error={errors["name"]}>
            <Input
              placeholder="Ej: Carlos Méndez"
              value={form.name}
              maxLength={80}
              onChange={(e) => set("name")(e.target.value)}
            />
          </Field>
          <Field label="Ciudad">
            <Select value={form.city} onValueChange={set("city")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Titular profesional" error={errors["headline"]}>
              <Input
                placeholder="Ej: Especialista en fade y arreglo de barba"
                value={form.headline}
                maxLength={120}
                onChange={(e) => set("headline")(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Años de experiencia" error={errors["experienceYears"]}>
            <Input
              type="number"
              min={0}
              max={60}
              placeholder="Ej: 5 años"
              value={form.experienceYears}
              onChange={(e) => set("experienceYears")(e.target.value)}
            />
          </Field>
          <Field label="Disponibilidad">
            <Select
              value={form.availability}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, availability: v as Availability }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABILITIES.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Especialidades" error={errors["specialties"]}>
              <Chips
                options={SPECIALTIES}
                selected={specialties}
                onToggle={(s) =>
                  setSpecialties((prev) =>
                    prev.includes(s) ? prev.filter((v) => v !== s) : [...prev, s],
                  )
                }
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Tipo de contrato que buscas" error={errors["contracts"]}>
              <Chips
                options={CONTRACT_TYPES}
                selected={contracts}
                onToggle={(c) =>
                  setContracts((prev) =>
                    prev.includes(c) ? prev.filter((v) => v !== c) : [...prev, c],
                  )
                }
              />
            </Field>
          </div>
          <Field label="Salario esperado desde (€/mes)" error={errors["salaryMin"]}>
            <Input
              type="number"
              min={0}
              max={9000}
              placeholder="Ej: 1500"
              value={form.salaryMin}
              onChange={(e) => set("salaryMin")(e.target.value)}
            />
          </Field>
          <Field label="Hasta (€/mes)" error={errors["salaryMax"]}>
            <Input
              type="number"
              min={0}
              max={9000}
              placeholder="Ej: 2200"
              value={form.salaryMax}
              onChange={(e) => set("salaryMax")(e.target.value)}
            />
          </Field>
        </div>

        <div className="space-y-4 rounded-xl border border-border/70 bg-card p-4">
          <Field label="Sobre mí" error={errors["bio"]}>
            <Textarea
              rows={4}
              maxLength={800}
              placeholder="Ej: Barbero con 5 años de experiencia en fade, barba y diseño freestyle. Busco jornada completa en Valencia."
              value={form.bio}
              onChange={(e) => set("bio")(e.target.value)}
            />
          </Field>
          <Field label="Formación y cursos (uno por línea: curso | centro | año)">
            <Textarea
              rows={4}
              maxLength={600}
              placeholder={"Máster en Fade | Academia Navaja | 2023\nBarbería clásica | Old Shop | 2021"}
              value={form.education}
              onChange={(e) => set("education")(e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Email de contacto" error={errors["email"]}>
              <Input
                type="email"
                placeholder="Ej: carlos@email.com"
                value={form.email}
                maxLength={255}
                onChange={(e) => set("email")(e.target.value)}
              />
            </Field>
            <Field label="WhatsApp (prefijo + número)" error={errors["whatsapp"]}>
              <Input
                placeholder="Ej: 34600123456"
                value={form.whatsapp}
                maxLength={15}
                onChange={(e) => set("whatsapp")(e.target.value.replace(/\D/g, ""))}
              />
            </Field>
            <Field label="Instagram (opcional)">
              <Input
                placeholder="@tuusuario"
                value={form.instagram}
                maxLength={40}
                onChange={(e) => set("instagram")(e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border/70 bg-card p-4">
          <Field label="Galería de fotos y vídeos" error={errors["gallery"]}>
            <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)_minmax(0,1fr)_auto]">
              <Select
                value={media.type}
                onValueChange={(v) => setMedia((m) => ({ ...m, type: v as "image" | "video" }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Foto</SelectItem>
                  <SelectItem value="video">Vídeo</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="https://..."
                value={media.url}
                onChange={(e) => setMedia((m) => ({ ...m, url: e.target.value }))}
              />
              <Input
                placeholder="Descripción (ej. Fade con diseño)"
                value={media.caption}
                maxLength={80}
                onChange={(e) => setMedia((m) => ({ ...m, caption: e.target.value }))}
              />
              <Button type="button" variant="secondary" onClick={addMedia}>
                <Plus className="h-4 w-4" /> Añadir
              </Button>
            </div>
          </Field>

          {gallery.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {gallery.map((g) => (
                <li key={g.id} className="overflow-hidden rounded-lg border border-border/70">
                  <div className="relative aspect-square bg-muted">
                    {g.type === "image" ? (
                      <img src={g.url} alt={g.caption} className="h-full w-full object-cover" />
                    ) : (
                      <video src={g.url} muted className="h-full w-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => setGallery((prev) => prev.filter((x) => x.id !== g.id))}
                      className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-md bg-background/85 text-destructive"
                      aria-label="Quitar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="truncate px-2 py-1.5 text-[11px] text-muted-foreground">
                    {g.caption}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full font-semibold sm:w-auto">
          Publicar mi portfolio
        </Button>
      </form>
    </div>
  );
}

function Chips<T extends string>({
  options,
  selected,
  onToggle,
}: {
  options: readonly T[];
  selected: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              on
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
