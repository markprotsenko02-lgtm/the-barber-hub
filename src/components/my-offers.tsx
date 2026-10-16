import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { getMyOffers } from "@/lib/directory.functions";
import { Button } from "@/components/ui/button";

export function MyOffers() {
  const q = useQuery({ queryKey: ["my-offers"], queryFn: () => getMyOffers() });
  const offers = q.data ?? [];
  if (!offers.length) return null;
  return (
    <section className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
      <h2 className="font-display text-2xl font-semibold uppercase">Mis ofertas publicadas</h2>
      <ul className="mt-4 space-y-3">
        {offers.map((o) => (
          <li key={o.id} className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3">
            <img src={o.logo} alt={o.shop_name} className="h-12 w-12 shrink-0 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{o.shop_name}</p>
              <p className="truncate text-xs text-muted-foreground">{o.looking_for}</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/publicar-oferta" search={{ editar: o.id }}>
                <Pencil className="mr-1 h-4 w-4" /> Editar
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
