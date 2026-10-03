import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import {
  CITIES,
  CONTRACT_TYPES,
  SPECIALTIES,
  type ContractType,
  type Specialty,
} from "@/lib/barber-data";
import { useBarbers } from "@/lib/barber-store";
import { useAuth } from "@/hooks/use-auth";
import { PhotoCapture } from "@/components/photo-capture";
import { askListingAlerts } from "@/components/new-listing-notifier";
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

export const Route = createFileRoute("/publicar-oferta")({
  head: () => ({
    meta: [
      { title: "Publicar búsqueda de barbero — BarberJobs" },
      {
        name: "description",
        content:
          "Publica el anuncio de tu barbería: a quién buscas, especialidades requeridas, ciudad, contrato y condiciones ofrecidas.",
      },
      { property: "og:title", content: "Publicar búsqueda de barbero — BarberJobs" },
      {
        property: "og:description",
        content: "Llega a barberos con portfolio publicado en tu ciudad.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PublishOffer,
});

const schema = z.object({
  shopName: z.string().trim().min(2, "Indica el nombre de la barbería").max(80),
  lookingFor: z.string().trim().min(5, "Describe a quién buscas").max(120),
  description: z.string().trim().min(20, "Cuenta algo más de la vacante").max(800),
  email: z.string().trim().email("Email no válido").max(255),
  whatsapp: z.string().trim().regex(/^\d{9,15}$/, "Solo números, con prefijo del país"),
  salaryMin: z.number().min(1, "Indica el salario ofrecido").max(9000),
  salaryMax: z.number().min(1, "Indica el salario ofrecido").max(9000),
});

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=900&q=80";
const DEFAULT_LOGO =
  "https://images.unsplash.com/photo-1521490683712-35a1cb61fa6d?auto=format&fit=crop&w=300&q=80";

const OFFER_TIPS = [
  {
    title: "Define el perfil que necesitas",
    text: "Concreta si buscas barbero senior, junior o mixto, y qué técnicas debe dominar en el día a día.",
  },
  {
    title: "Especialidades requeridas",
    text: "Marca las técnicas imprescindibles (fade, barba, tijera, color) para filtrar candidaturas.",
  },
  {
    title: "Modalidad y contrato",
    text: "Indica si es contrato por jornada, autónomo, porcentaje de comisión o alquiler de sillón.",
  },
  {
    title: "Nivel de experiencia",
    text: "Di los años mínimos que pides y si aceptas perfiles recién salidos de academia.",
  },
  {
    title: "Ambiente de la barbería",
    text: "Cuenta el tipo de clientela, el estilo del local y cómo se trabaja en equipo.",
  },
  {
    title: "Condiciones ofrecidas",
    text: "Fijo, comisiones, días libres, formación pagada y horarios: cuanto más claro, mejores respuestas.",
  },
];


function PublishOffer() {
  const { addOffer } = useBarbers();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({
    shopName: "",
    lookingFor: "",
    description: "",
    email: "",
    whatsapp: "",
    city: CITIES[0] as string,
    contractType: CONTRACT_TYPES[0] as ContractType,
    salaryMin: "",
    salaryMax: "",
    conditions: "",
  });
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [specialties, setSpecialties] = React.useState<Specialty[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Inicia sesión para publicar tu anuncio", {
        description: "Crea tu cuenta gratis en un minuto.",
      });
      navigate({ to: "/auth" });
      return;
    }
    const parsed = schema.safeParse({
      ...form,
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
    setErrors({});
    setSubmitting(true);
    try {
      await addOffer({
        shopName: parsed.data.shopName,
        city: form.city,
        logo: photos[1] ?? photos[0] ?? DEFAULT_LOGO,
        cover: photos[0] ?? DEFAULT_COVER,
        lookingFor: parsed.data.lookingFor,
        specialties,
        contractType: form.contractType,
        salaryMin: parsed.data.salaryMin,
        salaryMax: parsed.data.salaryMax,
        conditions: form.conditions
          .split("\n")
          .map((c) => c.trim())
          .filter(Boolean)
          .slice(0, 6),
        description: parsed.data.description,
        email: parsed.data.email,
        whatsapp: parsed.data.whatsapp,
      });
      toast.success("Anuncio publicado", {
        description: "Ya aparece en el muro de barberías.",
      });
      navigate({ to: "/" });
    } catch {
      toast.error("No se pudo publicar", {
        description: "Inténtalo de nuevo en unos segundos.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Button asChild size="sm" variant="ghost" className="-ml-2 mb-2 text-muted-foreground">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" /> Volver al muro
        </Link>
      </Button>
      <h1 className="font-display text-3xl font-semibold uppercase">
        Publicar búsqueda de barbero
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Rellena la vacante y aparecerá al instante en el muro de barberías.
      </p>

      <div className="mt-6">
        <TipsPanel
          title="Recomendaciones para publicar tu oferta"
          intro="Las ofertas con condiciones claras reciben respuestas de barberos que sí encajan."
          tips={OFFER_TIPS}
        />
      </div>

      <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
        <div className="space-y-3 rounded-xl border border-border/70 bg-card p-4">
          <p className="font-display text-sm uppercase tracking-wide">Fotos de tu barbería</p>
          <p className="text-xs text-muted-foreground">La primera será la portada del anuncio y la segunda el logo.</p>
          <PhotoCapture onUploaded={({ url }) => setPhotos((p) => [...p, url].slice(0, 6))} />
          {photos.length > 0 && (
            <ul className="grid grid-cols-3 gap-2">
              {photos.map((u) => (
                <li key={u} className="relative overflow-hidden rounded-lg border border-border/70">
                  <img src={u} alt="Foto de la barbería" className="aspect-square w-full object-cover" />
                  <button type="button" onClick={() => setPhotos((p) => p.filter((x) => x !== u))} className="absolute right-1 top-1 rounded bg-background/85 px-1.5 text-xs text-destructive">Quitar</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="grid gap-4 rounded-xl border border-border/70 bg-card p-4 sm:grid-cols-2">
          <Field label="Nombre de la barbería" error={errors["shopName"]}>
            <Input
              placeholder="Ej: Barbería La Navaja"
              value={form.shopName}
              maxLength={80}
              onChange={(e) => set("shopName")(e.target.value)}
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
            <Field label="¿A quién buscáis?" error={errors["lookingFor"]}>
              <Input
                placeholder="Ej: Barbero senior con dominio del fade y la barba"
                value={form.lookingFor}
                maxLength={120}
                onChange={(e) => set("lookingFor")(e.target.value)}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Especialidades requeridas" error={errors["specialties"]}>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map((s) => {
                  const on = specialties.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setSpecialties((prev) =>
                          prev.includes(s) ? prev.filter((v) => v !== s) : [...prev, s],
                        )
                      }
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>
        </div>

        <div className="grid gap-4 rounded-xl border border-border/70 bg-card p-4 sm:grid-cols-3">
          <Field label="Tipo de contrato">
            <Select
              value={form.contractType}
              onValueChange={(v) => setForm((f) => ({ ...f, contractType: v as ContractType }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTRACT_TYPES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Desde (€/mes)" error={errors["salaryMin"]}>
            <Input
              type="number"
              min={0}
              max={9000}
              placeholder="Ej: 1400"
              value={form.salaryMin}
              onChange={(e) => set("salaryMin")(e.target.value)}
            />
          </Field>
          <Field label="Hasta (€/mes)" error={errors["salaryMax"]}>
            <Input
              type="number"
              min={0}
              max={9000}
              placeholder="Ej: 2000"
              value={form.salaryMax}
              onChange={(e) => set("salaryMax")(e.target.value)}
            />
          </Field>
        </div>

        <div className="space-y-4 rounded-xl border border-border/70 bg-card p-4">
          <Field label="Descripción de la vacante" error={errors["description"]}>
            <Textarea
              rows={4}
              maxLength={800}
              placeholder="Ej: Buscamos barbero con experiencia en fade y arreglo de barba para incorporación inmediata. Clientela joven y ambiente de equipo."
              value={form.description}
              onChange={(e) => set("description")(e.target.value)}
            />
          </Field>
          <Field label="Condiciones ofrecidas (una por línea)">
            <Textarea
              rows={4}
              maxLength={500}
              placeholder={"Fijo + comisión\n2 días libres seguidos\nFormación pagada"}
              value={form.conditions}
              onChange={(e) => set("conditions")(e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email de contacto" error={errors["email"]}>
              <Input
                type="email"
                placeholder="Ej: contacto@barberia.com"
                value={form.email}
                maxLength={255}
                onChange={(e) => set("email")(e.target.value)}
              />
            </Field>
            <Field label="WhatsApp (con prefijo, solo números)" error={errors["whatsapp"]}>
              <Input
                placeholder="Ej: 34600123456"
                value={form.whatsapp}
                maxLength={15}
                onChange={(e) => set("whatsapp")(e.target.value.replace(/\D/g, ""))}
              />
            </Field>
          </div>
        </div>

        <Button type="submit" disabled={submitting} className="w-full font-semibold sm:w-auto">
          {submitting ? "Publicando…" : "Publicar anuncio"}
        </Button>
      </form>
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
