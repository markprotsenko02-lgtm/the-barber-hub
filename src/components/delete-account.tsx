import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAccount } from "@/lib/account.functions";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteAccount() {
  const del = useServerFn(deleteMyAccount);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      await del();
      await supabase.auth.signOut();
      toast.success("Tu cuenta y tus datos se han borrado.");
      navigate({ to: "/" });
    } catch {
      toast.error("No se pudo borrar la cuenta. Escríbenos y lo hacemos nosotros.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 sm:px-6">
      <div className="rounded-lg border border-destructive/40 p-4">
        <p className="text-sm font-semibold text-foreground">Borrar mi cuenta</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Elimina tu cuenta, tu portfolio y tus ofertas para siempre.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="mt-3" disabled={busy}>
              Borrar mi cuenta
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Seguro que quieres borrar tu cuenta?</AlertDialogTitle>
              <AlertDialogDescription>
                Se borrarán tu cuenta, tu portfolio y todas tus ofertas. No se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={run}>Sí, borrar todo</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
