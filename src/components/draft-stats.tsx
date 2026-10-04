import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Admin-only counter of drafts started vs published. Renders nothing for normal users. */
export function DraftStats() {
  const q = useQuery({
    queryKey: ["draft-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("draft_stats");
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 30000,
  });
  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("role", "admin");
      return (data?.length ?? 0) > 0;
    },
  });
  if (!isAdmin) return null;
  const rows = q.data ?? [];
  const get = (k: string) => rows.find((r) => r.kind === k) ?? { started: 0, published: 0, pending: 0 };
  const items = [
    { label: "Portfolios de barbero", ...get("portfolio") },
    { label: "Búsquedas de barbería", ...get("offer") },
  ];
  return (
    <div className="mx-auto max-w-xl px-4 pt-6">
      <div className="rounded-xl border border-primary/40 bg-card p-4">
        <h2 className="font-display text-lg font-semibold uppercase text-primary">Borradores (solo tú lo ves)</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {items.map((i) => (
            <div key={i.label} className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium">{i.label}</p>
              <p className="mt-1 text-2xl font-bold text-primary">{Number(i.pending)}</p>
              <p className="text-xs text-muted-foreground">a medias sin publicar</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {Number(i.started)} empezados · {Number(i.published)} publicados
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
