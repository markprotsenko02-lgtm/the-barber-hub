import * as React from "react";
import { LocateFixed, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CITIES } from "@/lib/barber-data";
import { Button } from "@/components/ui/button";
import { getCurrentPosition, reverseGeocodeCity } from "@/lib/native";

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Asks for location permission (system prompt) and filters offers by the user's city. */
export function NearMeButton({
  onCity,
  label = "Buscar barberías cerca de mí",
  what = "barberías",
}: {
  onCity: (city: string) => void;
  label?: string;
  what?: string;
}) {
  const [busy, setBusy] = React.useState(false);
  async function run() {
    setBusy(true);
    try {
      const pos = await getCurrentPosition();
      const city = await reverseGeocodeCity(pos.coords.latitude, pos.coords.longitude);
      const match = (CITIES as readonly string[]).find((c) => norm(c) === norm(city));
      if (match) {
        onCity(match);
        toast.success(`Mostrando ${what} en ${match}`);
      } else {
        toast.info(city ? `Estás en ${city}. Aún no hay ${what} de tu ciudad en la lista.` : "No pudimos saber tu ciudad");
      }
    } catch (e) {
      const code = (e as GeolocationPositionError)?.code;
      toast.error(
        code === 1
          ? "Ubicación denegada. Actívala en Ajustes > BarberHub > Ubicación."
          : "No se pudo obtener tu ubicación",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Button type="button" onClick={run} disabled={busy} variant="outline" className="mt-6 w-full border-primary/60 font-semibold text-primary sm:w-auto">
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
      {label}
    </Button>
  );
}
