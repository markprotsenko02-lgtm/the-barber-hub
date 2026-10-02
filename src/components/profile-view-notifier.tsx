import * as React from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  getNotificationPermission,
  requestNotificationPermission,
  showNotification,
  type NotifPermission,
} from "@/lib/native";

/** Listens for visits to the signed-in barber's profile and notifies them. */
export function ProfileViewNotifier() {
  const { user } = useAuth();
  React.useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`views-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "profile_views", filter: `owner_id=eq.${user.id}` },
        (payload) => {
          const name = (payload.new as { viewer_name?: string }).viewer_name || "Alguien";
          const body = `${name} ha visto tu perfil en BarberHub`;
          toast(body);
          void showNotification("Nueva visita a tu perfil", body);
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [user]);
  return null;
}

/** Button that triggers the system notification permission prompt. */
export function NotificationToggle() {
  const [perm, setPerm] = React.useState<NotifPermission | null>(null);
  React.useEffect(() => {
    void getNotificationPermission().then(setPerm);
  }, []);
  if (perm === null || perm === "unsupported") return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-4">
      <div className="min-w-0">
        <p className="font-display text-sm uppercase tracking-wide">Notificaciones</p>
        <p className="text-xs text-muted-foreground">
          {perm === "granted"
            ? "Activadas: te avisaremos cuando alguien con cuenta vea tu perfil."
            : perm === "denied"
              ? "Bloqueadas. Actívalas en Ajustes > BarberHub > Notificaciones."
              : "Recibe un aviso cuando alguien con cuenta vea tu perfil."}
        </p>
      </div>
      {perm === "prompt" && (
        <Button
          type="button"
          onClick={async () => {
            const r = await requestNotificationPermission();
            setPerm(r);
            if (r === "granted") toast.success("Notificaciones activadas");
          }}
        >
          <Bell className="h-4 w-4" /> Activar
        </Button>
      )}
    </div>
  );
}
