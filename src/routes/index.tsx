import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Scissors, Store, Search, SlidersHorizontal, X } from "lucide-react";
import {
  AVAILABILITIES,
  CITIES,
  CONTRACT_TYPES,
  SPECIALTIES,
} from "@/lib/barber-data";
import { useBarbers } from "@/lib/barber-store";
import { BarberCard } from "@/components/barber-card";
import { OfferCard } from "@/components/offer-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BarberMatch — Portfolios de barberos y ofertas de barberías" },
      {
        name: "description",
        content:
          "Muro visual de portfolios de barberos y anuncios de barberías que buscan personal. Filtra por ciudad, especialidad, contrato y salario.",
      },
      { property: "og:title", content: "BarberMatch — Talento de barbería en un solo muro" },
      {
        property: "og:description",
        content:
          "Descubre barberos por especialidad y ciudad, o publica tu búsqueda de personal para tu barbería.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const ALL = "__all__";

function Home() {
  const { barbers, offers } = useBarbers();
  const [tab, setTab] = React.useState<"barberos" | "barberias">("barberos");

  return (
    <div>
      <Hero tab={tab} onTab={setTab} />
      <main className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        {tab === "barberos" ? (
          <BarbersWall barbers={barbers} />
        ) : (
          <OffersWall offers={offers} />
        )}
      </main>
    </div>
  );
}

function Hero({
  tab,
  onTab,
}: {
  tab: "barberos" | "barberias";
  onTab: (t: "barberos" | "barberias") => void;
}) {
  return (
    <section className="surface-panel border-b border-border/70">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="max-w-3xl font-display text-4xl font-semibold uppercase leading-tight sm:text-6xl">
          El muro donde el <span className="text-gold-gradient">talento</span> de
          barbería se ve
        </h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
          Dos apartados, cero complicaciones: portfolios de barberos y anuncios de
          barberías buscando personal.
        </p>

        <div className="mt-8 inline-grid w-full max-w-md grid-cols-2 gap-1 rounded-xl border border-border bg-background/60 p-1">
          <button
            type="button"
            onClick={() => onTab("barberos")}
            aria-pressed={tab === "barberos"}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 font-display text-sm font-semibold uppercase tracking-wider transition-colors ${
              tab === "barberos"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Scissors className="h-4 w-4" /> Barberos
          </button>
          <button
            type="button"
            onClick={() => onTab("barberias")}
            aria-pressed={tab === "barberias"}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 font-display text-sm font-semibold uppercase tracking-wider transition-colors ${
              tab === "barberias"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Store className="h-4 w-4" /> Barberías
          </button>
        </div>
      </div>
    </section>
  );
}

function BarbersWall({ barbers }: { barbers: ReturnType<typeof useBarbers>["barbers"] }) {
  const [query, setQuery] = React.useState("");
  const [city, setCity] = React.useState(ALL);
  const [specialty, setSpecialty] = React.useState(ALL);
  const [contract, setContract] = React.useState(ALL);
  const [availability, setAvailability] = React.useState(ALL);
  const [maxSalary, setMaxSalary] = React.useState(3000);
  const [showFilters, setShowFilters] = React.useState(false);

  const filtered = barbers.filter((b) => {
    const q = query.trim().toLowerCase();
    if (q && !`${b.name} ${b.headline} ${b.city}`.toLowerCase().includes(q)) return false;
    if (city !== ALL && b.city !== city) return false;
    if (specialty !== ALL && !b.specialties.includes(specialty as never)) return false;
    if (contract !== ALL && !b.contractTypes.includes(contract as never)) return false;
    if (availability !== ALL && b.availability !== availability) return false;
    if (b.salaryMin > maxSalary) return false;
    return true;
  });

  const clear = () => {
    setQuery("");
    setCity(ALL);
    setSpecialty(ALL);
    setContract(ALL);
    setAvailability(ALL);
    setMaxSalary(3000);
  };

  return (
    <div className="py-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">
            Portfolios de barberos
          </h2>
          <p className="text-sm text-muted-foreground">
            {filtered.length} de {barbers.length} perfiles
          </p>
        </div>
        <Button asChild className="shrink-0 font-semibold">
          <Link to="/panel">Publicar mi portfolio</Link>
        </Button>
      </div>

      <div className="mt-6 space-y-3 rounded-xl border border-border/70 bg-card/60 p-3 sm:p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value.slice(0, 60))}
              placeholder="Buscar barbero, estilo o ciudad"
              className="pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters((v) => !v)}
            className="shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
          </Button>
        </div>

        {showFilters && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect label="Ciudad" value={city} onChange={setCity} options={CITIES} />
            <FilterSelect
              label="Especialidad"
              value={specialty}
              onChange={setSpecialty}
              options={SPECIALTIES}
            />
            <FilterSelect
              label="Tipo de contrato"
              value={contract}
              onChange={setContract}
              options={CONTRACT_TYPES}
            />
            <FilterSelect
              label="Disponibilidad"
              value={availability}
              onChange={setAvailability}
              options={AVAILABILITIES}
            />
            <div className="sm:col-span-2">
              <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                Salario esperado hasta {maxSalary} €/mes
              </p>
              <Slider
                value={[maxSalary]}
                min={800}
                max={3000}
                step={100}
                onValueChange={(v) => setMaxSalary(v[0] ?? 3000)}
              />
            </div>
            <div className="flex items-end">
              <Button type="button" variant="ghost" onClick={clear} className="text-muted-foreground">
                <X className="h-4 w-4" /> Limpiar filtros
              </Button>
            </div>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Ningún barbero coincide con estos filtros. Prueba a ampliarlos.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <BarberCard key={b.id} barber={b} />
          ))}
        </div>
      )}
    </div>
  );
}

function OffersWall({ offers }: { offers: ReturnType<typeof useBarbers>["offers"] }) {
  const [city, setCity] = React.useState(ALL);
  const [contract, setContract] = React.useState(ALL);
  const [specialty, setSpecialty] = React.useState(ALL);

  const filtered = offers.filter((o) => {
    if (city !== ALL && o.city !== city) return false;
    if (contract !== ALL && o.contractType !== contract) return false;
    if (specialty !== ALL && !o.specialties.includes(specialty as never)) return false;
    return true;
  });

  return (
    <div className="py-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">
            Barberías buscando personal
          </h2>
          <p className="text-sm text-muted-foreground">
            {filtered.length} de {offers.length} anuncios
          </p>
        </div>
        <Button asChild className="shrink-0 font-semibold">
          <Link to="/publicar-oferta">Publicar búsqueda de barbero</Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-3 rounded-xl border border-border/70 bg-card/60 p-3 sm:grid-cols-3 sm:p-4">
        <FilterSelect label="Ciudad" value={city} onChange={setCity} options={CITIES} />
        <FilterSelect
          label="Tipo de contrato"
          value={contract}
          onChange={setContract}
          options={CONTRACT_TYPES}
        />
        <FilterSelect
          label="Especialidad requerida"
          value={specialty}
          onChange={setSpecialty}
          options={SPECIALTIES}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No hay anuncios con estos filtros ahora mismo.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => (
            <OfferCard key={o.id} offer={o} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
