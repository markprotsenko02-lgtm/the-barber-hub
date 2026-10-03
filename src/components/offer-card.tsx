import { MapPin, Zap, Check, Mail, MessageCircle } from "lucide-react";
import type { ShopOffer } from "@/lib/shop-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthGate } from "@/components/auth-gate";
import { ReportButton } from "@/components/report-dialog";

export function OfferCard({ offer }: { offer: ShopOffer }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card transition-colors hover:border-primary/60">
      <div className="relative h-36 overflow-hidden">
        <img
          src={offer.cover}
          alt={offer.shopName}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        {offer.urgent && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
            <Zap className="h-3 w-3" /> Urgente
          </span>
        )}
        <div className="absolute bottom-3 left-3 right-3 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <img
            src={offer.logo}
            alt={offer.shopName}
            loading="lazy"
            className="h-11 w-11 shrink-0 rounded-md border border-primary/60 object-cover"
          />
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-semibold uppercase tracking-wide">
              {offer.shopName}
            </h3>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" /> {offer.city}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="font-semibold">{offer.lookingFor}</p>
        <p className="line-clamp-3 text-sm text-muted-foreground">{offer.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {offer.specialties.map((s) => (
            <Badge
              key={s}
              variant="outline"
              className="border-primary/40 bg-primary/10 text-[11px] text-primary"
            >
              {s}
            </Badge>
          ))}
        </div>

        <ul className="space-y-1 text-sm text-muted-foreground">
          {offer.conditions.slice(0, 4).map((c) => (
            <li key={c} className="flex items-start gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{c}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto space-y-3 border-t border-border/70 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium">
              {offer.contractType}
            </span>
            {offer.salaryMax > 0 && (
              <span className="font-semibold">
                {offer.salaryMin}–{offer.salaryMax} €/mes
              </span>
            )}
          </div>
          <AuthGate className={`grid gap-2 ${offer.email ? "grid-cols-2" : "grid-cols-1"}`}>
            <Button asChild size="sm" className="font-semibold">
              <a
                href={`https://wa.me/${offer.whatsapp}?text=${encodeURIComponent(
                  `Hola ${offer.shopName}, os escribo por la oferta publicada en BarberJobs.`,
                )}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </Button>
            {offer.email && (
              <Button asChild size="sm" variant="outline">
                <a href={`mailto:${offer.email}?subject=${encodeURIComponent("Candidatura BarberJobs")}`}>
                  <Mail className="h-4 w-4" /> Email
                </a>
              </Button>
            )}
          </AuthGate>
          <ReportButton target={{ type: "barbería", id: offer.id, name: offer.shopName, email: offer.email, whatsapp: offer.whatsapp }} />
        </div>
      </div>
    </article>
  );
}
