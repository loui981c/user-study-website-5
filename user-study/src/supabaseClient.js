import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://znfuroeustjbiwkymezq.supabase.co";
const supabaseKey = "sb_publishable_seymUlCb8Tg79c4EnVx_Pg_gEb4b3zc";

export const supabase = createClient(supabaseUrl, supabaseKey);
