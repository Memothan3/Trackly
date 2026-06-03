import { createClient } from "@supabase/supabase-js"
import { tracklyConfig } from "@/lib/config"
import { getFirebaseIdToken } from "@/lib/firebase"

/**
 * Firebase Auth JWT is sent on each request (Third-Party Auth).
 * Do not use supabase.auth.setSession() with a Firebase token — that hits /auth/v1/user and returns 403.
 */
export const supabase = createClient(
	tracklyConfig.supabaseUrl,
	tracklyConfig.supabaseAnonKey,
	{
		accessToken: async () => getFirebaseIdToken(),
	}
)