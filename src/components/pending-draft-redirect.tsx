import * as React from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { pendingRoute } from "@/lib/pending-draft";

/** After signing in, send the user back to the form they left unfinished so it publishes. */
export function PendingDraftRedirect() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  React.useEffect(() => {
    if (!user) return;
    const route = pendingRoute();
    if (!route || pathname === route) return;
    const t = setTimeout(() => navigate({ to: route as "/publicar-portfolio" }), 50);
    return () => clearTimeout(t);
  }, [user, pathname, navigate]);
  return null;
}
