import { createClient } from "@supabase/supabase-js"
import { tracklyConfig } from "@/lib/config"

export const supabase = createClient(
	tracklyConfig.supabaseUrl,
	tracklyConfig.supabaseAnonKey
)
