import * as React from "react";
import { LocateFixed, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getCurrentPosition, NEAR_RADIUS_KM, type Coords } from "@/lib/native";

/** Asks for location permission and hands back the user's coordinates (5 km radius filter). */
export function NearMeButton({
  onLocate,
  active,
  onClear,
  label = "Buscar barberías cerca de mí",
  what = "barberías",
}: {
  onLocate: (c: Coords) => void;
  active?: boolean;
  onClear?: () => void;
  label?: string;
  what?: string;
}) {
  const [busy, setBusy] = React.useState(false);
  const [ask, setAsk] = React.useState(false);
  async function run() {
    setAsk(false);
    setBusy(true);
    try {
      const pos = await getCurrentPosition();
      onLocate(pos);
      toast.success(`Mostrando ${what} a menos de ${NEAR_RADIUS_KM} km de ti`);
    } catch (e) {
      const code = (e as { code?: number })?.code;
      const embedded = typeof window !== "undefined" && window.top !== window;
      if (code === 1 && embedded) {
        // Inside an embedded frame (e.g. editor preview) the browser blocks location without asking.
        toast.error("Aquí la ubicación está bloqueada. Abre BarberJobs en una pestaña para que te pregunte.", {
          action: { label: "Abrir", onClick: () => window.open(window.location.href, "_blank", "noopener") },
          duration: 10000,
        });
        return;
      }
      toast.error(
        code === 1
          ? "No pudimos acceder a tu ubicación. Pulsa de nuevo y acepta, o elige tu ciudad en los filtros."
          : "No se pudo obtener tu ubicación. Inténtalo de nuevo.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (active) {
    return (
      <Button type="button" onClick={onClear} variant="outline" className="mt-6 w-full border-primary font-semibold text-primary sm:w-auto">
        <LocateFixed className="h-4 w-4" />
        Cerca de ti ({NEAR_RADIUS_KM} km) · Quitar
      </Button>
    );
  }
  return (
    <>
      <Button type="button" onClick={() => setAsk(true)} disabled={busy} variant="outline" className="mt-6 w-full border-primary/60 font-semibold text-primary sm:w-auto">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
        {label}
      </Button>
      <AlertDialog open={ask} onOpenChange={setAsk}>
        <AlertDialogContent className="max-w-sm border-primary/50 bg-card shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Permitir acceso a tu ubicación?</AlertDialogTitle>
            <AlertDialogDescription>
              BarberJobs usará tu ubicación solo para mostrarte {what} cerca de ti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => toast("Ubicación no permitida. Puedes elegir tu ciudad en los filtros.")}>
              Denegar
            </AlertDialogCancel>
            <AlertDialogAction onClick={run}>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
