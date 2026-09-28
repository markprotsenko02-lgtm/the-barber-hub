import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, ImagePlus, Trash2, Eye } from "lucide-react";
import { z } from "zod";
import {
  AVAILABILITIES,
  CITIES,
  CONTRACT_TYPES,
  SPECIALTIES,
  type Availability,
  type ContractType,
  type Specialty,
} from "@/lib/barber-data";
import { useBarbers } from "@/lib/barber-store";
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
  const { barbers, updateBarber, addGalleryItem, removeGalleryItem } = useBarbers();
  const [selected, setSelected] = React.useState(barbers[0]?.id ?? "");
  const barber = barbers.find((b) => b.id === selected) ?? barbers[0];

  const [media, setMedia] = React.useState({ url: "", caption: "", type: "image" as "image" | "video" });
  const [mediaError, setMediaError] = React.useState("");

  if (!barber)
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold uppercase">Aún no tienes portfolio</h1>
        <p className="mt-2 text-sm text-muted-foreground">Publica tu portfolio para poder editarlo aquí.</p>
        <Button asChild className="mt-6">
          <Link to="/publicar-portfolio">Publicar mi portfolio</Link>
        </Button>
      </div>
    );

  const toggle = <T extends string>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const addMedia = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = mediaSchema.safeParse(media);
    if (!parsed.success) {
      setMediaError(parsed.error.issues[0]?.message ?? "Revisa los datos");
      return;
    }
    setMediaError("");
    addGalleryItem(barber.id, {
      type: media.type,
      url: parsed.data.url,
      caption: parsed.data.caption,
    });
    setMedia({ url: "", caption: "", type: media.type });
    toast.success("Trabajo añadido a tu galería");
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
            Todo lo que rellenes aquí se ve al instante en el muro de barberos.
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link to="/barberos/$barberId" params={{ barberId: barber.id }}>
            <Eye className="h-4 w-4" /> Ver perfil
          </Link>
        </Button>
      </div>

      <div className="mt-6 rounded-xl border border-border/70 bg-card p-4">
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
            Perfil que estás editando (demo)
          </span>
          <Select value={barber.id} onValueChange={setSelected}>
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {barbers.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      <section className="mt-6 space-y-4 rounded-xl border border-border/70 bg-card p-4">
        <h2 className="font-display text-xl uppercase tracking-wide">Datos profesionales</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre">
            <Input
              value={barber.name}
              maxLength={60}
              onChange={(e) => updateBarber(barber.id, { name: e.target.value })}
            />
          </Field>
          <Field label="Titular / eslogan">
            <Input
              value={barber.headline}
              maxLength={120}
              onChange={(e) => updateBarber(barber.id, { headline: e.target.value })}
            />
          </Field>
          <Field label="Ciudad">
            <Select
              value={barber.city}
              onValueChange={(v) => updateBarber(barber.id, { city: v })}
            >
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
              value={barber.experienceYears}
              onChange={(e) =>
                updateBarber(barber.id, {
                  experienceYears: Math.max(0, Math.min(50, Number(e.target.value) || 0)),
                })
              }
            />
          </Field>
        </div>
        <Field label="Sobre mí">
          <Textarea
            rows={4}
            maxLength={800}
            value={barber.bio}
            onChange={(e) => updateBarber(barber.id, { bio: e.target.value })}
          />
        </Field>
        <Field label="Especialidades">
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((s) => {
              const on = barber.specialties.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    updateBarber(barber.id, {
                      specialties: toggle<Specialty>(barber.specialties, s),
                    })
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
      </section>

      <section className="mt-6 space-y-4 rounded-xl border border-border/70 bg-card p-4">
        <h2 className="font-display text-xl uppercase tracking-wide">
          Expectativas laborales
        </h2>
        <Field label="Tipo de contrato que busco">
          <div className="flex flex-wrap gap-2">
            {CONTRACT_TYPES.map((c) => {
              const on = barber.contractTypes.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() =>
                    updateBarber(barber.id, {
                      contractTypes: toggle<ContractType>(barber.contractTypes, c),
                    })
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
              value={barber.availability}
              onValueChange={(v) =>
                updateBarber(barber.id, { availability: v as Availability })
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
          <Field label="Salario mínimo (€/mes)">
            <Input
              type="number"
              min={0}
              max={9000}
              value={barber.salaryMin}
              onChange={(e) =>
                updateBarber(barber.id, { salaryMin: Number(e.target.value) || 0 })
              }
            />
          </Field>
          <Field label="Salario máximo (€/mes)">
            <Input
              type="number"
              min={0}
              max={9000}
              value={barber.salaryMax}
              onChange={(e) =>
                updateBarber(barber.id, { salaryMax: Number(e.target.value) || 0 })
              }
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email de contacto">
            <Input
              type="email"
              value={barber.email}
              maxLength={255}
              onChange={(e) => updateBarber(barber.id, { email: e.target.value })}
            />
          </Field>
          <Field label="WhatsApp (con prefijo, solo números)">
            <Input
              value={barber.whatsapp}
              maxLength={15}
              onChange={(e) =>
                updateBarber(barber.id, { whatsapp: e.target.value.replace(/\D/g, "") })
              }
            />
          </Field>
        </div>
      </section>

      <section className="mt-6 space-y-4 rounded-xl border border-border/70 bg-card p-4">
        <h2 className="font-display text-xl uppercase tracking-wide">Formación</h2>
        {barber.education.map((e, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_90px]">
            <Input
              value={e.title}
              maxLength={90}
              placeholder="Curso o certificación"
              onChange={(ev) => {
                const next = [...barber.education];
                next[i] = { ...e, title: ev.target.value };
                updateBarber(barber.id, { education: next });
              }}
            />
            <Input
              value={e.school}
              maxLength={90}
              placeholder="Academia"
              onChange={(ev) => {
                const next = [...barber.education];
                next[i] = { ...e, school: ev.target.value };
                updateBarber(barber.id, { education: next });
              }}
            />
            <Input
              value={e.year}
              maxLength={4}
              placeholder="Año"
              onChange={(ev) => {
                const next = [...barber.education];
                next[i] = { ...e, year: ev.target.value.replace(/\D/g, "") };
                updateBarber(barber.id, { education: next });
              }}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            updateBarber(barber.id, {
              education: [...barber.education, { title: "", school: "", year: "" }],
            })
          }
        >
          Añadir formación
        </Button>
      </section>

      <section className="mt-6 space-y-4 rounded-xl border border-border/70 bg-card p-4">
        <h2 className="font-display text-xl uppercase tracking-wide">
          Galería de trabajos
        </h2>
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
          {mediaError && (
            <p className="text-xs text-destructive sm:col-span-2">{mediaError}</p>
          )}
        </form>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {barber.gallery.map((g) => (
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
                onClick={() => removeGalleryItem(barber.id, g.id)}
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
