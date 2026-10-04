import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  MapPin,
  Clock,
  BriefcaseBusiness,
  Wallet,
  GraduationCap,
  Mail,
  MessageCircle,
  Instagram,
} from "lucide-react";
import { useBarbers } from "@/lib/barber-store";
import { getBarberSeo } from "@/lib/directory.functions";
import { GalleryGrid } from "@/components/gallery-lightbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact-form";
import { WhatsAppIcon } from "@/components/whatsapp";
import { AuthGate } from "@/components/auth-gate";
import { logContact } from "@/lib/contact-log";
import { ReportButton } from "@/components/report-dialog";

export const Route = createFileRoute("/barberos/$barberId")({
  loader: async ({ params }) => {
    try {
      return { seo: await getBarberSeo({ data: { id: params.barberId } }) };
    } catch {
      return { seo: null };
    }
  },
  head: ({ params, loaderData }) => {
    const b = loaderData?.seo;
    const url = `https://barberjobs.es/barberos/${params.barberId}`;
    const title = b ? `${b.name} — Barbero en ${b.city || "España"} | BarberJobs` : "Perfil de barbero — BarberJobs";
    const desc = b
      ? `${b.name}${b.headline ? `, ${b.headline}` : ""}. ${b.experience_years} años de experiencia en ${b.city || "España"}. Mira su portfolio de cortes en BarberJobs.`.slice(0, 160)
      : "Portfolio de barbero en BarberJobs: galería de cortes, formación y condiciones laborales.";
    const img = b && /^https:\/\//.test(b.cover || b.avatar) ? b.cover || b.avatar : null;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: BarberProfile,
});

function BarberProfile() {
  const { barberId } = Route.useParams();
  const { barbers } = useBarbers();
  const barber = barbers.find((b) => b.id === barberId);
  const { user } = useAuth();
  const logged = React.useRef(false);
  React.useEffect(() => {
    if (!user || !barber || logged.current) return;
    logged.current = true;
    const meta = user.user_metadata as { first_name?: string; last_name?: string; full_name?: string };
    const viewerName = meta.full_name || [meta.first_name, meta.last_name].filter(Boolean).join(" ") || "Un usuario";
    // RLS rejects self-views silently.
    void supabase.from("profile_views").insert({ barber_id: barber.id, viewer_name: viewerName });
  }, [user, barber]);

  if (!barber) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl uppercase">Perfil no encontrado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Este barbero ya no está publicado.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Volver al muro</Link>
        </Button>
      </div>
    );
  }

  const waLink = `https://wa.me/${barber.whatsapp}?text=${encodeURIComponent(
    `Hola ${barber.name}, he visto tu portfolio en BarberJobs y me gustaría hablar contigo sobre una vacante.`,
  )}`;

  return (
    <div className="pb-16">
      <div className="relative h-56 overflow-hidden sm:h-72">
        <img src={barber.cover} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        <div className="absolute left-4 top-4">
          <Button asChild size="sm" variant="secondary">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" /> Muro
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto -mt-16 max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-end gap-4">
          <img
            src={barber.avatar}
            alt={barber.name}
            className="h-24 w-24 shrink-0 rounded-xl border-2 border-primary object-cover sm:h-28 sm:w-28"
          />
          <div className="min-w-0 pb-1">
            <h1 className="truncate font-display text-3xl font-semibold uppercase sm:text-4xl">
              {barber.name}
            </h1>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {barber.neighborhood ? `${barber.neighborhood}, ${barber.city}` : barber.city}
              </span>
              {barber.experienceYears > 0 && <span>{barber.experienceYears} años de experiencia</span>}
              {barber.instagram && (
                <span className="flex items-center gap-1">
                  <Instagram className="h-3.5 w-3.5" /> {barber.instagram}
                </span>
              )}
            </p>
          </div>
        </div>

        <p className="mt-5 max-w-2xl text-base text-foreground/90">{barber.headline}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {barber.specialties.map((s) => (
            <Badge key={s} className="bg-primary/15 text-primary" variant="outline">
              {s}
            </Badge>
          ))}
        </div>

        <AuthGate className="mt-6 flex flex-wrap items-center gap-2">
          <Button asChild className="font-semibold">
            <a onClick={() => void logContact("barber", barber.id, "whatsapp")} href={waLink} target="_blank" rel="noreferrer noopener">
              <MessageCircle className="h-4 w-4" /> Contactar por WhatsApp
            </a>
          </Button>
          {barber.email && (
            <Button asChild variant="outline">
              <a
                href={`mailto:${barber.email}?subject=${encodeURIComponent(
                  "Oferta de trabajo vía BarberJobs",
                )}`}
              >
                <Mail className="h-4 w-4" /> Enviar email
              </a>
            </Button>
          )}
        </AuthGate>

        <AuthGate className="mt-4 flex flex-wrap gap-2">
          <a
            onClick={() => void logContact("barber", barber.id, "whatsapp")}
            href={waLink}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-2 text-sm transition-colors hover:border-primary/60"
          >
            <WhatsAppIcon className="h-4 w-4 text-emerald-500" />
            <span className="text-muted-foreground">WhatsApp:</span>
            <span className="font-medium tracking-wider">+{barber.whatsapp.slice(0, -9) || "34"} ••• ••• •••</span>
          </a>
          {barber.email && (
            <a
              href={`mailto:${barber.email}`}
              className="flex items-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-2 text-sm transition-colors hover:border-primary/60"
            >
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{barber.email}</span>
            </a>
          )}
        </AuthGate>

        <ReportButton className="mt-3" target={{ type: "barbero", id: barber.id, name: barber.name, email: barber.email, whatsapp: barber.whatsapp }} />

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="min-w-0 space-y-8">
            <div>
              <h2 className="mb-3 font-display text-xl uppercase tracking-wide">
                Galería de trabajos
              </h2>
              <GalleryGrid items={barber.gallery} />
            </div>

            {barber.bio && (
              <div>
                <h2 className="mb-3 font-display text-xl uppercase tracking-wide">Sobre mí</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{barber.bio}</p>
              </div>
            )}

            {barber.education.length > 0 && (
            <div>
              <h2 className="mb-3 font-display text-xl uppercase tracking-wide">
                Formación y certificaciones
              </h2>
              <ul className="space-y-3">
                {barber.education.map((e) => (
                  <li
                    key={`${e.title}-${e.year}`}
                    className="flex items-start gap-3 rounded-lg border border-border/70 bg-card p-3"
                  >
                    <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="font-medium">{e.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.school} · {e.year}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            )}
          </section>

          <aside className="min-w-0 space-y-6">
            <div className="rounded-xl border border-border/70 bg-card p-4">
              <h2 className="mb-3 font-display text-lg uppercase tracking-wide">
                Condiciones buscadas
              </h2>
              <dl className="space-y-3 text-sm">
                <Row icon={<Clock className="h-4 w-4 text-primary" />} label="Disponibilidad">
                  {barber.availability}
                </Row>
                <Row
                  icon={<BriefcaseBusiness className="h-4 w-4 text-primary" />}
                  label="Tipo de contrato"
                >
                  {barber.contractTypes.join(", ")}
                </Row>
                {barber.salaryMax > 0 && (
                  <Row icon={<Wallet className="h-4 w-4 text-primary" />} label="Salario esperado">
                    {barber.salaryMin}–{barber.salaryMax} €/mes
                  </Row>
                )}
                <Row icon={<MapPin className="h-4 w-4 text-primary" />} label="Ciudad">
                  {barber.neighborhood ? `${barber.neighborhood}, ${barber.city}` : barber.city}
                </Row>
              </dl>
            </div>

            <AuthGate>
              <ContactForm barberName={barber.name} />
            </AuthGate>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
        <dd className="font-medium">{children}</dd>
      </div>
    </div>
  );
}
