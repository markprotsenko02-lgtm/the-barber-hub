import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  target: z.object({
    type: z.enum(["barbero", "barbería"]),
    id: z.string().min(1).max(100),
    name: z.string().min(1).max(200),
    email: z.string().max(255).optional(),
    whatsapp: z.string().max(30).optional(),
  }),
  reason: z.string().min(1).max(120),
  details: z.string().max(1500),
});

export const submitReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => schema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name,last_name,email")
      .eq("id", userId)
      .maybeSingle();
    const reporterName =
      `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() || "Sin nombre";
    const reporterEmail = profile?.email ?? String(context.claims?.email ?? "");

    const { error } = await supabase.from("reports").insert({
      reporter_id: userId,
      reporter_name: reporterName,
      reporter_email: reporterEmail,
      target_type: data.target.type,
      target_id: data.target.id,
      target_name: data.target.name,
      target_email: data.target.email ?? null,
      target_whatsapp: data.target.whatsapp ?? null,
      reason: data.reason,
      details: data.details,
    });
    if (error) throw new Error("No se pudo guardar el reporte");
    return { ok: true };
  });
