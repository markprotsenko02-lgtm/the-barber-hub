import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import {
  AVAILABILITIES,
  CITIES,
  CONTRACT_TYPES,
  SPECIALTIES,
  type ContractType,
  type GalleryItem,
  type Specialty,
} from "@/lib/barber-data";
import { useBarbers } from "@/lib/barber-store";
import { useAuth } from "@/hooks/use-auth";
import { PhotoCapture } from "@/components/photo-capture";
import { AVATARS, AvatarPicker } from "@/components/avatar-picker";
import { askListingAlerts } from "@/components/new-listing-notifier";
import { TipsPanel } from "@/components/tips-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      { title: "Publicar mi portfolio de barbero — BarberJobs" },
      {
        name: "description",
        content:
          "Publica tu portfolio de barbero en un minuto: nombre, ciudad, especialidades, contrato, WhatsApp y tus mejores fotos.",
      },
      { property: "og:title", content: "Publicar mi portfolio de barbero — BarberJobs" },
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
  whatsapp: z.string().trim().regex(/^\d{9,15}$/, "Solo números, con prefijo del país"),
  email: z.union([z.literal(""), z.string().trim().email("Email no válido").max(255)]),
});

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1503443207922-dff7d543fd0e?auto=format&fit=crop&w=300&q=80";
const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80";

const TIPS = [
  {
    title: "Fotos nítidas",
    text: "Sube trabajos de fade y barba con buena luz, fondo limpio y enfoque en el detalle del degradado.",
  },
  {
    title: "Marca solo lo que dominas",
    text: "Elige tus especialidades y el tipo de contrato que buscas de verdad.",
  },
  {
    title: "WhatsApp con prefijo",
    text: "Pon el número con prefijo del país (34 para España) para que te escriban en el momento.",
  },
];

function PublishPortfolio() {
  const { addBarber } = useBarbers();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    city: CITIES[0] as string,
    whatsapp: "",
    email: "",
  });
  const [avatar, setAvatar] = React.useState(AVATARS[0] as string);
  const [specialties, setSpecialties] = React.useState<Specialty[]>([]);
  const [contracts, setContracts] = React.useState<ContractType[]>([]);
  const [gallery, setGallery] = React.useState<GalleryItem[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Inicia sesión para publicar tu portfolio", {
        description: "Crea tu cuenta gratis en un minuto.",
      });
      navigate({ to: "/auth" });
      return;
    }
    const parsed = schema.safeParse(form);
    const next: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
    }
    if (specialties.length === 0) next["specialties"] = "Elige al menos una especialidad";
    if (contracts.length === 0) next["contracts"] = "Elige al menos un tipo de contrato";
    if (gallery.length === 0) next["gallery"] = "Añade al menos una foto de tu trabajo";
    setErrors(next);
    if (!parsed.success || Object.keys(next).length > 0) return;

    const firstImage = gallery.find((g) => g.type === "image");
    setSubmitting(true);
    try {
      const created = await addBarber({
        name: parsed.data.name,
        headline: specialties.slice(0, 3).join(" · "),
        city: form.city,
        avatar,
        cover: firstImage?.url ?? DEFAULT_COVER,
        specialties,
        contractTypes: contracts,
        availability: AVAILABILITIES[0],
        salaryMin: 0,
        salaryMax: 0,
        experienceYears: 0,
        bio: "",
        education: [],
        email: parsed.data.email,
        whatsapp: parsed.data.whatsapp,
        gallery,
      });
      toast.success("Portfolio publicado", {
        description: "Ya apareces en el muro de barberos.",
      });
      navigate({ to: "/barberos/$barberId", params: { barberId: created.id } });
      askListingAlerts("barber");
    } catch {
      toast.error("No se pudo publicar", {
        description: "Inténtalo de nuevo en unos segundos.",
      });
    } finally {
      setSubmitting(false);
    }
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
        Solo lo esencial y tus fotos. Se publica al instante.
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
          <div className="sm:col-span-2">
            <Field label="WhatsApp (prefijo + número)" error={errors["whatsapp"]}>
              <Input
                inputMode="numeric"
                placeholder="Ej: 34600123456"
                value={form.whatsapp}
                maxLength={15}
                onChange={(e) => set("whatsapp")(e.target.value.replace(/\D/g, ""))}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Email de contacto (opcional)" error={errors["email"]}>
              <Input
                type="email"
                placeholder="Ej: carlos@email.com"
                value={form.email}
                maxLength={255}
                onChange={(e) => set("email")(e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-border/70 bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Foto de perfil</p>
          <AvatarPicker value={avatar} onChange={setAvatar} />
        </div>

        <div className="space-y-4 rounded-xl border border-border/70 bg-card p-4">
          <Field label="Fotos de tus cortes" error={errors["gallery"]}>
            <PhotoCapture
              onUploaded={({ url, type }) =>
                setGallery((g) => [
                  { id: `g-${Date.now().toString(36)}`, type, url, caption: "Trabajo" },
                  ...g,
                ])
              }
            />
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
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button type="submit" size="lg" disabled={submitting} className="w-full font-semibold sm:w-auto">
          {submitting ? "Publicando…" : "Publicar mi portfolio"}
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
