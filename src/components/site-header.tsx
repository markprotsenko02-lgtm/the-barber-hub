import { Link } from "@tanstack/react-router";
import { Scissors } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
            <Scissors className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-semibold uppercase tracking-widest">
              Barber<span className="text-primary">Match</span>
            </span>
            <span className="hidden text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:block">
              Portfolios &amp; fichajes
            </span>
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-1 text-sm font-medium sm:gap-4">
          <Link
            to="/"
            className="rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
            activeOptions={{ exact: true }}
          >
            Directorio
          </Link>
          <Link
            to="/panel"
            className="rounded-md bg-primary px-3 py-1.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Panel barbero
          </Link>
        </nav>
      </div>
      <div className="hairline-gold h-px w-full" />
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/70 bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground sm:px-6">
        <p className="font-display text-base uppercase tracking-[0.2em] text-foreground">
          BarberMatch
        </p>
        <p className="mt-2 max-w-md">
          El escaparate donde los barberos muestran su trabajo y las barberías
          fichan talento con criterio.
        </p>
        <p className="mt-6 text-xs">
          Datos de demostración con fines de prueba. © {new Date().getFullYear()} BarberMatch.
        </p>
      </div>
    </footer>
  );
}
