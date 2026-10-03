import { Link } from "@tanstack/react-router";
import { MapPin, Clock, Star, BriefcaseBusiness } from "lucide-react";
import type { Barber } from "@/lib/barber-data";
import { Badge } from "@/components/ui/badge";

export function BarberCard({ barber }: { barber: Barber }) {
  const preview = barber.gallery.filter((g) => g.type === "image").slice(0, 3);

  return (
    <Link
      to="/barberos/$barberId"
      params={{ barberId: barber.id }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card transition-all hover:border-primary/60 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={barber.cover}
          alt={`Trabajo de ${barber.name}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        {barber.featured && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
            <Star className="h-3 w-3" /> Destacado
          </span>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex min-w-0 items-end gap-3">
          <img
            src={barber.avatar}
            alt={barber.name}
            loading="lazy"
            className="h-12 w-12 shrink-0 rounded-full border-2 border-primary/80 object-cover"
          />
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-semibold uppercase tracking-wide">
              {barber.name}
            </h3>
            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" /> {barber.city}
              {barber.experienceYears > 0 && ` · ${barber.experienceYears} años de experiencia`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="line-clamp-2 text-sm text-muted-foreground">{barber.headline}</p>

        <div className="flex flex-wrap gap-1.5">
          {barber.specialties.slice(0, 3).map((s) => (
            <Badge
              key={s}
              variant="outline"
              className="border-primary/40 bg-primary/10 text-[11px] font-medium text-primary"
            >
              {s}
            </Badge>
          ))}
        </div>

        {preview.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5">
            {preview.map((g) => (
              <img
                key={g.id}
                src={g.url}
                alt={g.caption}
                loading="lazy"
                className="aspect-square w-full rounded-md object-cover opacity-90 transition-opacity group-hover:opacity-100"
              />
            ))}
          </div>
        )}

        <div className="mt-auto space-y-1.5 border-t border-border/70 pt-3 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <BriefcaseBusiness className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{barber.contractTypes.join(" · ")}</span>
          </p>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
              {barber.availability}
            </span>
            {barber.salaryMax > 0 && (
              <span className="shrink-0 font-semibold text-foreground">
                {barber.salaryMin}–{barber.salaryMax} €/mes
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
