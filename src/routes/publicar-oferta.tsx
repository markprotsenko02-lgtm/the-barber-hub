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
import { clearDraft, ensureUploaded, isPending, loadDraft, saveDraft } from "@/lib/pending-draft";
import { PhotoCapture } from "@/components/photo-capture";
import { AVATARS, AvatarPicker } from "@/components/avatar-picker";
import { WhatsAppInput } from "@/components/whatsapp";
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

export const Route = createFileRoute("/publicar-oferta")({
  head: () => ({
    meta: [
      { title: "Publicar búsqueda de barbero — BarberJobs" },
      {
        name: "description",
        content:
          "Publica tu búsqueda de barbero en un minuto: nombre, ciudad, a quién buscas, contrato, WhatsApp y fotos.",
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
  whatsapp: z.string().trim().regex(/^\d{9}$/, "Introduce los 9 dígitos de tu móvil"),
  email: z.union([z.literal(""), z.string().trim().email("Email no válido").max(255)]),
});

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=900&q=80";

const OFFER_TIPS = [
  {
    title: "Di a quién buscas",
    text: "Concreta si buscas barbero senior o junior y qué técnicas debe dominar.",
  },
  {
    title: "Fotos del local",
    text: "Una buena foto de tu barbería atrae más candidatos.",
  },
  {
    title: "WhatsApp con prefijo",
    text: "Pon el número con prefijo del país (34 para España) para que te escriban al momento.",
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
    whatsapp: "",
    email: "",
    city: CITIES[0] as string,
    contractType: CONTRACT_TYPES[0] as ContractType,
  });
  const [logo, setLogo] = React.useState(AVATARS[0] as string);
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [specialties, setSpecialties] = React.useState<Specialty[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  type Draft = {
    form: typeof form;
    logo: string;
    photos: string[];
    specialties: Specialty[];
  };
  const [restored, setRestored] = React.useState(false);
  const autoRan = React.useRef(false);

  React.useEffect(() => {
    const d = loadDraft<Draft>("offer");
    if (d) {
      setForm(d.form);
      setLogo(d.logo);
      setPhotos(d.photos);
      setSpecialties(d.specialties);
    }
    setRestored(true);
  }, []);

  React.useEffect(() => {
    if (!restored) return;
    saveDraft("offer", { form, logo, photos, specialties }, false);
  }, [restored, form, logo, photos, specialties]);

  const publish = async (userId: string, d: Draft) => {
    setSubmitting(true);
    try {
      const up = (u: string) => ensureUploaded(userId, u);
      const finalPhotos = await Promise.all(d.photos.map(up));
      const finalLogo = await up(d.logo);
      await addOffer({
        shopName: d.form.shopName.trim(),
        city: d.form.city,
        logo: finalLogo,
        cover: finalPhotos[0] ?? DEFAULT_COVER,
        lookingFor: d.form.lookingFor.trim(),
        specialties: d.specialties,
        contractType: d.form.contractType,
        salaryMin: 0,
        salaryMax: 0,
        conditions: [],
        description: d.form.lookingFor.trim(),
        email: d.form.email.trim(),
        whatsapp: `34${d.form.whatsapp.replace(/\D/g, "")}`,
      });
      clearDraft("offer");
      toast.success("Anuncio publicado", {
        description: "Ya aparece en el muro de barberías.",
      });
      navigate({ to: "/" });
      askListingAlerts("shop");
    } catch {
      toast.error("No se pudo publicar", {
        description: "Inténtalo de nuevo en unos segundos.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (!restored || !user || autoRan.current || !isPending("offer")) return;
    const d = loadDraft<Draft>("offer");
    if (!d) return;
    autoRan.current = true;
    void publish(user.id, d);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restored, user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    const next: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
    }
    if (specialties.length === 0) next["specialties"] = "Elige al menos una especialidad";
    if (photos.length === 0) next["photos"] = "Añade al menos una foto de tu barbería";
    setErrors(next);
    if (!parsed.success || Object.keys(next).length > 0) return;
    const draft: Draft = { form, logo, photos, specialties };
    if (!user) {
      saveDraft("offer", draft, true);
      toast.success("¡Casi listo! Crea tu cuenta para publicarlo", {
        description: "Tus datos y fotos están guardados. Se publicará solo al entrar.",
      });
      navigate({ to: "/auth" });
      return;
    }
    await publish(user.id, draft);
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
        Solo lo esencial y las fotos de tu barbería. Aparece al instante en el muro.
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
          <p className="text-xs text-muted-foreground">La primera será la portada del anuncio.</p>
          {errors["photos"] && <p className="text-xs text-destructive">{errors["photos"]}</p>}
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

        <div className="grid gap-4 rounded-xl border border-border/70 bg-card p-4 sm:grid-cols-2">
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
          <Field label="WhatsApp" error={errors["whatsapp"]}>
            <WhatsAppInput value={form.whatsapp} onChange={set("whatsapp")} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Email de contacto (opcional)" error={errors["email"]}>
              <Input
                type="email"
                placeholder="Ej: contacto@barberia.com"
                value={form.email}
                maxLength={255}
                onChange={(e) => set("email")(e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-border/70 bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Logo o foto de perfil</p>
          <AvatarPicker value={logo} onChange={setLogo} />
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
