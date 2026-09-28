import * as React from "react";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AuthGate } from "@/components/auth-gate";
import { submitReport } from "@/lib/reports.functions";

export const REPORT_REASONS = [
  "Información falsa o engañosa",
  "Fotos o vídeos que no son suyos",
  "Contenido inapropiado u ofensivo",
  "Spam o publicidad",
  "Posible estafa o fraude",
  "Condiciones laborales ilegales o abusivas",
  "Discriminación o acoso",
  "Datos de contacto incorrectos",
  "Anuncio duplicado",
  "Suplantación de identidad",
  "Otro motivo",
] as const;

export type ReportTarget = {
  type: "barbero" | "barbería";
  id: string;
  name: string;
  email?: string;
  whatsapp?: string;
};

export function ReportButton({ target, className }: { target: ReportTarget; className?: string }) {
  const send = useServerFn(submitReport);
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState<string>("");
  const [details, setDetails] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function onSend() {
    if (!reason) return toast.error("Elige un motivo del reporte");
    setBusy(true);
    try {
      await send({ data: { target, reason, details: details.trim() } });
      toast.success("Reporte enviado. Gracias por avisarnos.");
      setOpen(false);
      setReason("");
      setDetails("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo enviar el reporte");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthGate className={className}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
          >
            <Flag className="h-3.5 w-3.5" /> Reportar
          </button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wide">
              Reportar a {target.name}
            </DialogTitle>
            <DialogDescription>Elige el motivo y añade la información que quieras.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {REPORT_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  reason === r
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div>
            <label htmlFor="report-details" className="mb-1 block text-sm font-medium">
              Añadir información
            </label>
            <Textarea
              id="report-details"
              rows={4}
              maxLength={1500}
              placeholder="Ej: Las fotos del portfolio pertenecen a otra barbería."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
          <Button onClick={onSend} disabled={busy} className="w-full font-semibold">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Enviar
          </Button>
        </DialogContent>
      </Dialog>
    </AuthGate>
  );
}
