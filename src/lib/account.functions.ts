import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const uid = context.userId;
    const { error: e1 } = await context.supabase.from("barbers").delete().eq("user_id", uid);
    if (e1) throw new Error(e1.message);
    const { error: e2 } = await context.supabase.from("shop_offers").delete().eq("user_id", uid);
    if (e2) throw new Error(e2.message);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(uid);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
