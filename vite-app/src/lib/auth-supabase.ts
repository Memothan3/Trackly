import { createClient } from "@supabase/supabase-js"
import { tracklyConfig } from "@/lib/config"

/** Pre-login Supabase client (username lookup, profile bootstrap). */
export const authSupabase = createClient(
	tracklyConfig.supabaseUrl,
	tracklyConfig.supabaseAnonKey
)