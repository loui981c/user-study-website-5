import { supabase } from "./supabaseClient";
import { DESIGN_APPROACH } from "./constants";

export async function logEvent(sessionId, siteName, step, eventType, eventTarget) {
  const event = {
    session_id: sessionId,
    design_variant: DESIGN_APPROACH.BASELINE,
    site_name: siteName,
    trial_index: step,
    event_type: eventType,
    event_target: eventTarget,
  };

  const { error } = await supabase
    .from("log")
    .insert([event]);

  if (error) {
    console.error("Supabase insert error:", error);
  }
}
