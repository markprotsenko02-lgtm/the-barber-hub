import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, ImagePlus, Trash2, Eye, Save } from "lucide-react";
import { z } from "zod";
import {
  AVAILABILITIES,
  CITIES,
  CONTRACT_TYPES,
  SPECIALTIES,
  type Availability,
  type Barber,
  type ContractType,
  type Specialty,
} from "@/lib/barber-data";
import { useBarbers, useMyBarber } from "@/lib/barber-store";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/panel")({
  head: () => ({
    meta: [
      { title: "Panel del barbero — Publica tu portfolio | BarberHub" },
      {
        name: "description",
        content:
          "Actualiza tu perfil de barbero: especialidades, formación, disponibilidad, salario esperado y sube fotos o vídeos de tus cortes.",
      },
      { property: "og:title", content: "Panel del barbero — BarberHub" },
      {
        property: "og:description",
        content: "Crea y edita tu portfolio de barbero en pocos minutos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PanelPage,
});

const mediaSchema = z.object({
  url: z.string().trim().url("Pega una URL válida de imagen o vídeo").max(500),
  caption: z.string().trim().min(2, "Añade un título").max(80),
});

function PanelPage() {
  const { user, loading: authLoading } = useAuth();
  const myBarberQ = useMyBarber(!!user);

  if (authLoading || (user && myBarberQ.isLoading)) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-sm text-muted-foreground">
        Cargando tu panel…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold uppercase">Inicia sesión</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          El panel es solo para usuarios registrados. Entra o crea tu cuenta para editar tu
          portfolio.
        </p>
        <Button asChild className="mt-6">
          <Link to="/auth">Entrar / Registrarse</Link>
        </Button>
      </div>
    );
  }

  const barber = myBarberQ.data ?? null;

  if (!barber) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold uppercase">Aún no tienes portfolio</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Publica tu portfolio para poder editarlo aquí.
        </p>
        <Button asChild className="mt-6">
          <Link to="/publicar-portfolio">Publicar mi portfolio</Link>
        </Button>
      </div>
    );
  }

  return <PanelEditor key={barber.id} barber={barber} />;
}

function PanelEditor({ barber }: { barber: Barber }) {
  const { updateBarber, addGalleryItem, removeGalleryItem } = useBarbers();
  const [draft, setDraft] = React.useState<Barber>(barber);
  const [saving, setSaving] = React.useState(false);
  const [media, setMedia] = React.useState({
    url: "",
    caption: "",
    type: "image" as "image" | "video",
  });
  const [mediaError, setMediaError] = React.useState("");

  const patch = (p: Partial<Barber>) => setDraft((d) => ({ ...d, ...p }));

  const toggle = <T extends string>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const save = async () => {
    setSaving(true);
    try {
      const { id: _id, ...input } = draft;
      await updateBarber(barber.id, input);
      toast.success("Cambios guardados", {
        description: "Tu portfolio ya está actualizado en el muro.",
      });
    } catch {
      toast.error("No se pudieron guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const addMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = mediaSchema.safeParse(media);
    if (!parsed.success) {
      setMediaError(parsed.error.issues[0]?.message ?? "Revisa los datos");
      return;
    }
    setMediaError("");
    try {
      await addGalleryItem(barber.id, {
        type: media.type,
        url: parsed.data.url,
        caption: parsed.data.caption,
      });
      setDraft((d) => ({
        ...d,
        gallery: [
          { id: `g-${Date.now().toString(36)}`, type: media.type, url: parsed.data.url, caption: parsed.data.caption },
          ...d.gallery,
        ],
      }));
      setMedia({ url: "", caption: "", type: media.type });
      toast.success("Trabajo añadido a tu galería");
    } catch {
      toast.error("No se pudo añadir el trabajo");
    }
  };

  const removeMedia = async (itemId: string) => {
    try {
      await removeGalleryItem(barber.id, itemId);
      setDraft((d) => ({ ...d, gallery: d.gallery.filter((g) => g.id !== itemId) }));
    } catch {
      toast.error("No se pudo eliminar");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <Button asChild size="sm" variant="ghost" className="-ml-2 mb-2 text-muted-foreground">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" /> Volver al muro
            </Link>
          </Button>
          <h1 className="font-display text-3xl font-semibold uppercase">Mi portfolio</h1>
          <p className="text-sm text-muted-foreground">
            Edita tus datos y pulsa guardar: se verá al instante en el muro de barberos.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline">
            <Link to="/barberos/$barberId" params={{ barberId: barber.id }}>
              <Eye className="h-4 w-4" /> Ver perfil
            </Link>
          </Button>
          <Button onClick={save} disabled={saving} className="font-semibold">
            <Save className="h-4 w-4" /> {saving ? "Guardando…" : "Guardar cambios"}
          </Button>
        </div>
      </div>

      <section className="mt-6 space-y-4 rounded-xl border border-border/70 bg-card p-4">
        <h2 className="font-display text-xl uppercase tracking-wide">Datos profesionales</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre">
            <Input
              value={draft.name}
              maxLength={60}
              onChange={(e) => patch({ name: e.target.value })}
            />
          </Field>
          <Field label="Titular / eslogan">
            <Input
              value={draft.headline}
              maxLength={120}
              onChange={(e) => patch({ headline: e.target.value })}
            />
          </Field>
          <Field label="Ciudad">
            <Select value={draft.city} onValueChange={(v) => patch({ city: v })}>
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
          <Field label="Años de experiencia">
            <Input
              type="number"
              min={0}
              max={50}
              value={draft.experienceYears}
              onChange={(e) =>
                patch({ experienceYears: Math.max(0, Math.min(50, Number(e.target.value) || 0)) })
              }
            />
          </Field>
        </div>
        <Field label="Sobre mí">
          <Textarea
            rows={4}
            maxLength={800}
            value={draft.bio}
            onChange={(e) => patch({ bio: e.target.value })}
          />
        </Field>
        <Field label="Especialidades">
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((s) => {
              const on = draft.specialties.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => patch({ specialties: toggle<Specialty>(draft.specialties, s) })}
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
      </section>

      <section className="mt-6 space-y-4 rounded-xl border border-border/70 bg-card p-4">
        <h2 className="font-display text-xl uppercase tracking-wide">Expectativas laborales</h2>
        <Field label="Tipo de contrato que busco">
          <div className="flex flex-wrap gap-2">
            {CONTRACT_TYPES.map((c) => {
              const on = draft.contractTypes.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() =>
                    patch({ contractTypes: toggle<ContractType>(draft.contractTypes, c) })
                  }
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Disponibilidad">
            <Select
              value={draft.availability}
              onValueChange={(v) => patch({ availability: v as Availability })}
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
          <Field label="Salario mínimo (€/mes)">
            <Input
              type="number"
              min={0}
              max={9000}
              value={draft.salaryMin}
              onChange={(e) => patch({ salaryMin: Number(e.target.value) || 0 })}
            />
          </Field>
          <Field label="Salario máximo (€/mes)">
            <Input
              type="number"
              min={0}
              max={9000}
              value={draft.salaryMax}
              onChange={(e) => patch({ salaryMax: Number(e.target.value) || 0 })}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email de contacto">
            <Input
              type="email"
              value={draft.email}
              maxLength={255}
              onChange={(e) => patch({ email: e.target.value })}
            />
          </Field>
          <Field label="WhatsApp (con prefijo, solo números)">
            <Input
              value={draft.whatsapp}
              maxLength={15}
              onChange={(e) => patch({ whatsapp: e.target.value.replace(/\D/g, "") })}
            />
          </Field>
        </div>
      </section>

      <section className="mt-6 space-y-4 rounded-xl border border-border/70 bg-card p-4">
        <h2 className="font-display text-xl uppercase tracking-wide">Formación</h2>
        {draft.education.map((ed, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_90px]">
            <Input
              value={ed.title}
              maxLength={90}
              placeholder="Curso o certificación"
              onChange={(ev) => {
                const next = [...draft.education];
                next[i] = { ...ed, title: ev.target.value };
                patch({ education: next });
              }}
            />
            <Input
              value={ed.school}
              maxLength={90}
              placeholder="Academia"
              onChange={(ev) => {
                const next = [...draft.education];
                next[i] = { ...ed, school: ev.target.value };
                patch({ education: next });
              }}
            />
            <Input
              value={ed.year}
              maxLength={4}
              placeholder="Año"
              onChange={(ev) => {
                const next = [...draft.education];
                next[i] = { ...ed, year: ev.target.value.replace(/\D/g, "") };
                patch({ education: next });
              }}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            patch({ education: [...draft.education, { title: "", school: "", year: "" }] })
          }
        >
          Añadir formación
        </Button>
      </section>

      <section className="mt-6 space-y-4 rounded-xl border border-border/70 bg-card p-4">
        <h2 className="font-display text-xl uppercase tracking-wide">Galería de trabajos</h2>
        <form onSubmit={addMedia} className="grid gap-2 sm:grid-cols-[130px_minmax(0,1fr)]" noValidate>
          <Select
            value={media.type}
            onValueChange={(v) => setMedia((m) => ({ ...m, type: v as "image" | "video" }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image">Foto</SelectItem>
              <SelectItem value="video">Vídeo</SelectItem>
            </SelectContent>
          </Select>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]">
            <Input
              placeholder="URL de la foto o vídeo"
              value={media.url}
              maxLength={500}
              onChange={(e) => setMedia((m) => ({ ...m, url: e.target.value }))}
            />
            <Input
              placeholder="Título del trabajo"
              value={media.caption}
              maxLength={80}
              onChange={(e) => setMedia((m) => ({ ...m, caption: e.target.value }))}
            />
            <Button type="submit" className="shrink-0 font-semibold">
              <ImagePlus className="h-4 w-4" /> Subir
            </Button>
          </div>
          {mediaError && <p className="text-xs text-destructive sm:col-span-2">{mediaError}</p>}
        </form>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {draft.gallery.map((g) => (
            <div key={g.id} className="relative overflow-hidden rounded-lg border border-border/70">
              {g.type === "image" ? (
                <img src={g.url} alt={g.caption} className="aspect-square w-full object-cover" />
              ) : (
                <video src={g.url} muted className="aspect-square w-full object-cover" />
              )}
              <Badge className="absolute left-1.5 top-1.5 bg-background/80 text-[10px] text-foreground">
                {g.type === "image" ? "Foto" : "Vídeo"}
              </Badge>
              <button
                type="button"
                aria-label={`Eliminar ${g.caption}`}
                onClick={() => removeMedia(g.id)}
                className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-md bg-background/85 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <p className="truncate p-2 text-xs text-muted-foreground">{g.caption}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
