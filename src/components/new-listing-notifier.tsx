import * as React from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
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
import { requestNotificationPermission, showNotification } from "@/lib/native";

export type ListingRole = "barber" | "shop";
const KEY = "bj-new-listing-alerts";
const EVT = "bj-ask-listing-alerts";

function readRoles(): ListingRole[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

/** Call after a barber publishes a portfolio ("barber") or a shop publishes an offer ("shop"). */
export function askListingAlerts(role: ListingRole) {
  window.dispatchEvent(new CustomEvent(EVT, { detail: role }));
}

/** Global: shows the opt-in dialog and notifies on new listings of the opposite side. */
export function NewListingNotifier() {
  const { user } = useAuth();
  const [ask, setAsk] = React.useState<ListingRole | null>(null);
  const [roles, setRoles] = React.useState<ListingRole[]>([]);

  React.useEffect(() => {
    setRoles(readRoles());
    const h = (e: Event) => {
      const role = (e as CustomEvent<ListingRole>).detail;
      if (!readRoles().includes(role)) setAsk(role);
    };
    window.addEventListener(EVT, h);
    return () => window.removeEventListener(EVT, h);
  }, []);

  React.useEffect(() => {
    if (!user || roles.length === 0) return;
    const ch = supabase.channel(`listings-${user.id}`);
    if (roles.includes("barber")) {
      ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "shop_offers" }, (p) => {
        const n = p.new as { user_id?: string; shop_name?: string; city?: string };
        if (n.user_id === user.id) return;
        const body = `${n.shop_name || "Una barbería"}${n.city ? ` (${n.city})` : ""} busca barbero`;
        toast(body);
        void showNotification("Nueva vacante en BarberJobs", body);
      });
    }
    if (roles.includes("shop")) {
      ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "barbers" }, (p) => {
        const n = p.new as { user_id?: string; name?: string; city?: string };
        if (n.user_id === user.id) return;
        const body = `${n.name || "Un barbero"}${n.city ? ` (${n.city})` : ""} ha publicado su portfolio`;
        toast(body);
        void showNotification("Nuevo barbero en BarberJobs", body);
      });
    }
    ch.subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [user, roles]);

  const accept = async () => {
    const role = ask;
    setAsk(null);
    if (!role) return;
    const r = await requestNotificationPermission();
    if (r !== "granted") {
      toast("No se activaron las notificaciones.");
      return;
    }
    const next = Array.from(new Set([...readRoles(), role]));
    localStorage.setItem(KEY, JSON.stringify(next));
    setRoles(next);
    toast.success(
      role === "barber"
        ? "Te avisaremos cuando una barbería publique una vacante"
        : "Te avisaremos cuando un barbero publique su portfolio",
    );
  };

  return (
    <AlertDialog open={ask !== null} onOpenChange={(o) => !o && setAsk(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Permitir notificaciones?</AlertDialogTitle>
          <AlertDialogDescription>
            {ask === "barber"
              ? "BarberJobs te avisará cada vez que una barbería publique una vacante."
              : "BarberJobs te avisará cada vez que un barbero publique su portfolio."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No permitir</AlertDialogCancel>
          <AlertDialogAction onClick={accept}>Permitir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
