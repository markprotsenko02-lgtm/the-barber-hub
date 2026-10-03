import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { askListingAlerts } from "@/components/new-listing-notifier";

/** Inviting empty state: publish CTA + "notify me" button for the wall's listing type. */
export function EmptyWall({ kind, hasAny }: { kind: "barbers" | "shops"; hasAny: boolean }) {
  const barbers = kind === "barbers";
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-primary/40 bg-card/40 p-8 text-center">
      <p className="font-display text-xl font-semibold uppercase">
        {hasAny
          ? barbers ? "Aún no hay barberos con estos filtros" : "Aún no hay barberías con estos filtros"
          : barbers ? "Sé el primero en aparecer aquí" : "Sé la primera barbería en publicar"}
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        {barbers
          ? "Publica tu portfolio gratis en 2 minutos y que las barberías te encuentren."
          : "Publica tu búsqueda gratis en 2 minutos y recibe barberos interesados."}
      </p>
      <div className="mt-5 flex flex-col items-center gap-2">
        <Button asChild className="font-semibold">
          <Link to={barbers ? "/publicar-portfolio" : "/publicar-oferta"}>
            {barbers ? "Publicar mi portfolio" : "Publicar búsqueda de barbero"}
          </Link>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-primary/50 text-primary"
          onClick={() => askListingAlerts(barbers ? "shop" : "barber")}
        >
          <Bell className="h-4 w-4" />
          {barbers ? "Avísame cuando haya barberos" : "Avísame cuando haya barberías"}
        </Button>
      </div>
    </div>
  );
}
