import { initializeApp } from "firebase/app"
import {
	browserLocalPersistence,
	browserPopupRedirectResolver,
	getAuth,
	initializeAuth,
	type Auth,
} from "firebase/auth"
import { tracklyConfig } from "@/lib/config"

const app = initializeApp(tracklyConfig.firebase)

function createFirebaseAuth(): Auth {
	try {
		return initializeAuth(app, {
			persistence: browserLocalPersistence,
			popupRedirectResolver: browserPopupRedirectResolver,
		})
	} catch {
		// Hot reload / duplicate init — reuse existing instance.
		return getAuth(app)
	}
}

export const firebaseAuth = createFirebaseAuth()

/** Firebase ID token for Supabase Third-Party Auth (not a Supabase session). */
export async function getFirebaseIdToken(forceRefresh = false): Promise<string | null> {
	const user = firebaseAuth.currentUser
	if (!user) return null
	return user.getIdToken(forceRefresh)
}