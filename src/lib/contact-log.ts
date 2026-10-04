import { supabase } from "@/integrations/supabase/client";

/** Records that a signed-in user tapped a contact button (counts as a "candidate"). */
export async function logContact(targetType: "barber" | "offer", targetId: string, channel: "whatsapp" | "email") {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    await supabase.from("contact_clicks").insert({ target_type: targetType, target_id: targetId, channel });
  } catch {
    /* ignore */
  }
}
