import * as React from "react";
import { Input } from "@/components/ui/input";

export const VALENCIA_BARRIOS = [
  "Ciutat Vella", "El Carme", "La Seu", "La Xerea", "El Mercat", "Sant Francesc", "El Pilar",
  "L'Eixample", "Russafa", "El Pla del Remei", "Gran Via",
  "Extramurs", "El Botànic", "La Roqueta", "La Petxina", "Arrancapins",
  "Campanar", "Les Tendetes", "El Calvari", "Sant Pau",
  "La Saïdia", "Marxalenes", "Morvedre", "Trinitat", "Tormos", "Sant Antoni",
  "El Pla del Real", "Exposició", "Mestalla", "Jaume Roig", "Ciutat Universitària",
  "Olivereta", "Nou Moles", "Soternes", "Tres Forques", "La Fontsanta", "La Llum",
  "Patraix", "Sant Isidre", "Vara de Quart", "Safranar", "Favara",
  "Jesús", "La Raiosa", "L'Hort de Senabre", "La Creu Coberta", "Sant Marcel·lí", "Camí Real",
  "Quatre Carreres", "Montolivet", "En Corts", "Malilla", "Fonteta de Sant Lluís", "Na Rovella", "La Punta", "Ciutat de les Arts i les Ciències",
  "Poblats Marítims", "El Grau", "El Cabanyal", "El Canyamelar", "La Malva-rosa", "Beteró", "Natzaret",
  "Camins al Grau", "Aiora", "Albors", "La Creu del Grau", "Camí Fondo", "Penya-roja",
  "Algirós", "L'Illa Perduda", "Ciutat Jardí", "L'Amistat", "La Bega Baixa", "La Carrasca",
  "Benimaclet", "Camí de Vera",
  "Rascanya", "Orriols", "Torrefiel", "Sant Llorenç",
  "Benicalap", "Ciutat Fallera",
  "Pobles del Nord", "Benifaraig", "Poble Nou", "Carpesa", "Borbotó", "Massarrojos", "Mauella", "Cases de Bàrcena",
  "Pobles de l'Oest", "Benimàmet", "Beniferri",
  "Pobles del Sud", "El Forn d'Alcedo", "Castellar-l'Oliveral", "Pinedo", "El Saler", "El Palmar", "El Perellonet", "La Torre", "Faitanar",
];

const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, "").toLowerCase().replace(/z/g, "s").replace(/x/g, "ch").replace(/(.)\1/g, "$1");

export function matchBarrios(q: string) {
  const n = norm(q);
  if (!n) return VALENCIA_BARRIOS.slice(0, 8);
  return VALENCIA_BARRIOS.filter((b) => norm(b).includes(n)).slice(0, 8);
}

export function NeighborhoodField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const list = matchBarrios(value);
  return (
    <div className="relative">
      <Input
        placeholder="Ej: Russafa (opcional)"
        value={value}
        maxLength={60}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        aria-label="Barrio"
        autoComplete="off"
      />
      {open && list.length > 0 && !VALENCIA_BARRIOS.includes(value) && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover py-1 shadow-lg">
          {list.map((b) => (
            <li key={b}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange(b); setOpen(false); }}
              >
                {b}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SalaryFields({
  min, max, onMin, onMax,
}: { min: string; max: string; onMin: (v: string) => void; onMax: (v: string) => void }) {
  const clean = (v: string) => v.replace(/\D/g, "").slice(0, 4);
  return (
    <div className="flex items-center gap-2">
      <Input inputMode="numeric" placeholder="Ej: 1200" value={min} onChange={(e) => onMin(clean(e.target.value))} aria-label="Salario mínimo" />
      <span className="text-muted-foreground">–</span>
      <Input inputMode="numeric" placeholder="Ej: 1600" value={max} onChange={(e) => onMax(clean(e.target.value))} aria-label="Salario máximo" />
      <span className="shrink-0 text-sm text-muted-foreground">€/mes</span>
    </div>
  );
}

export function parseSalary(min?: string, max?: string) {
  let a = Number(min || 0), b = Number(max || 0);
  if (a && !b) b = a;
  if (b && !a) a = b;
  if (a > b) [a, b] = [b, a];
  return { salaryMin: Math.min(a, 9000), salaryMax: Math.min(b, 9000) };
}
