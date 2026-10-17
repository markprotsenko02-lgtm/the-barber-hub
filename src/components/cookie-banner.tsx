import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem("bj-cookies")) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  const choose = (yes: boolean) => {
    try {
      localStorage.setItem("bj-cookies", yes ? "yes" : "no");
    } catch {
      /* ignore */
    }
    const g = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    g?.("consent", "update", { analytics_storage: yes ? "granted" : "denied" });
    setShow(false);
  };

  if (!show) return null;
  return (
    <div className="fixed inset-x-3 bottom-24 z-50 mx-auto max-w-lg rounded-lg border border-border bg-card p-4 shadow-lg md:bottom-4">
      <p className="text-sm text-muted-foreground">
        Usamos cookies técnicas y, si aceptas, estadísticas de Google Analytics para saber cuánta gente
        visita la web.{" "}
        <Link to="/aviso-legal" className="text-primary underline">
          Más info
        </Link>
      </p>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={() => choose(false)}>
          Rechazar
        </Button>
        <Button size="sm" className="flex-1" onClick={() => choose(true)}>
          Aceptar
        </Button>
      </div>
    </div>
  );
}
