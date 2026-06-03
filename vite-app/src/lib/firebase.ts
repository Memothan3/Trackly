import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { tracklyConfig } from "@/lib/config"

const app = initializeApp(tracklyConfig.firebase)
export const firebaseAuth = getAuth(app)

/** Firebase ID token for Supabase Third-Party Auth (not a Supabase session). */
export async function getFirebaseIdToken(forceRefresh = false): Promise<string | null> {
	const user = firebaseAuth.currentUser
	if (!user) return null
	return user.getIdToken(forceRefresh)
}
