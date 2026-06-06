import {
	createUserWithEmailAndPassword,
	getRedirectResult,
	GoogleAuthProvider,
	OAuthProvider,
	sendEmailVerification,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
	signInWithPopup,
	signInWithRedirect,
	type AuthProvider,
	type User,
} from "firebase/auth"
import {
	getAuthContinueUrl,
	hasAppAccess,
	isAdminEmail,
	normalizeUsername,
	validateUsername,
} from "@/lib/auth-config"
import { authSupabase } from "@/lib/auth-supabase"
import { tracklyConfig } from "@/lib/config"
import { firebaseAuth } from "@/lib/firebase"
import { supabase } from "@/lib/supabase"

export type ProfileSyncInput = {
	username?: string
	fullName?: string
	phone?: string
	country?: string
	currency?: string
}

export type ProfileSyncResult =
	| { success: true }
	| { success: false; message: string }

function actionCodeSettings() {
	return {
		url: getAuthContinueUrl(),
		handleCodeInApp: true,
	}
}

export function formatAuthError(error: unknown) {
	if (error && typeof error === "object" && "code" in error) {
		const code = String((error as { code: string }).code)
		const message =
			"message" in error ? String((error as { message: string }).message) : ""

		switch (code) {
			case "auth/invalid-credential":
			case "auth/wrong-password":
			case "auth/user-not-found":
			case "auth/invalid-login-credentials":
				return "Incorrect email/username or password."
			case "auth/email-already-in-use":
				return "An account with this email already exists. Try signing in."
			case "auth/invalid-email":
				return "Invalid email address."
			case "auth/weak-password":
				return "Password is too weak. Use at least 6 characters."
			case "auth/too-many-requests":
				return "Too many attempts. Please wait and try again."
			case "auth/invalid-action-code":
				return "This link has expired or was already used."
			case "auth/popup-closed-by-user":
				return "Sign-in was cancelled."
			case "auth/popup-blocked":
				return "Pop-up was blocked. Trying redirect sign-in…"
			case "auth/cancelled-popup-request":
				return "Sign-in was interrupted. Please try again."
			case "auth/operation-not-supported-in-this-environment":
				return "This browser requires redirect sign-in. Please try again."
			case "auth/unauthorized-domain":
				return "This domain is not authorized for sign-in. Add it in Firebase Console → Authentication → Settings → Authorized domains."
			case "auth/operation-not-allowed":
				return "This sign-in provider is not enabled in Firebase Authentication."
			case "auth/account-exists-with-different-credential":
				return "An account already exists with this email using a different sign-in method."
			default:
				return message.replace(/^Firebase: /, "").replace(/ \(auth\/.*\)\.?/, "")
		}
	}
	if (error instanceof Error) {
		return error.message
	}
	return "Something went wrong. Please try again."
}

export async function resolveLoginEmail(identifier: string) {
	const value = identifier.trim()
	if (!value) {
		throw new Error("Enter your email or username.")
	}
	if (value.includes("@")) {
		return value
	}

	const username = normalizeUsername(value)
	const { data: rpcEmail, error: rpcError } = await authSupabase.rpc(
		"resolve_login_email",
		{ login_identifier: username }
	)

	if (!rpcError && typeof rpcEmail === "string" && rpcEmail.includes("@")) {
		return rpcEmail
	}

	const { data, error } = await authSupabase
		.from("profiles")
		.select("email")
		.eq("username", username)
		.maybeSingle()

	if (error) {
		throw new Error("Could not look up username. Try signing in with your email.")
	}

	const email = (data as { email?: string | null } | null)?.email
	if (!email) {
		throw new Error(
			"Username not found, or no email is linked yet. Sign in with your email instead."
		)
	}
	return email
}

export async function isUsernameAvailable(username: string) {
	const normalized = normalizeUsername(username)
	const validation = validateUsername(normalized)
	if (validation) return { available: false, message: validation }

	const { data, error } = await authSupabase
		.from("profiles")
		.select("username")
		.eq("username", normalized)
		.maybeSingle()

	if (error) {
		return { available: false, message: "Could not check username availability." }
	}
	return {
		available: !data,
		message: data ? "Username is already taken." : null,
	}
}

function profileDb() {
	return firebaseAuth.currentUser ? supabase : authSupabase
}

export async function syncUserProfile(
	user: User,
	input: ProfileSyncInput = {}
): Promise<ProfileSyncResult> {
	const email = user.email ?? undefined
	const db = profileDb()
	const { data: existing, error: checkError } = await db
		.from("profiles")
		.select("id, username, email")
		.eq("id", user.uid)
		.maybeSingle()

	if (checkError && checkError.code !== "PGRST116") {
		return {
			success: false,
			message: checkError.message || "Could not read your profile.",
		}
	}

	if (existing) {
		const patch: Record<string, string> = {
			updated_at: new Date().toISOString(),
		}
		if (email) patch.email = email
		if (input.fullName) patch.full_name = input.fullName
		if (input.currency) patch.currency = input.currency

		const { error } = await db.from("profiles").update(patch).eq("id", user.uid)

		if (error) {
			return { success: false, message: error.message }
		}
		return { success: true }
	}

	const username =
		input.username ||
		normalizeUsername(user.email?.split("@")[0] ?? `user_${user.uid.slice(0, 6)}`)

	const profileData: Record<string, string | null> = {
		id: user.uid,
		username,
		full_name:
			input.fullName ||
			user.displayName ||
			user.email?.split("@")[0] ||
			"Trackly user",
		email: email ?? null,
		phone: input.phone ?? null,
		country: input.country ?? null,
		currency: input.currency ?? tracklyConfig.defaultCurrency,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	}

	const { error } = await db.from("profiles").insert(profileData)
	if (error) {
		if (
			error.message.includes("duplicate") ||
			error.message.includes("unique")
		) {
			return {
				success: false,
				message: "Username already exists. Choose a different username.",
			}
		}
		return { success: false, message: error.message }
	}

	return { success: true }
}

export async function signInWithIdentifier(identifier: string, password: string) {
	const email = await resolveLoginEmail(identifier)
	const credential = await signInWithEmailAndPassword(
		firebaseAuth,
		email,
		password
	)
	return credential.user
}

export async function signUpWithEmail(input: {
	fullName: string
	username: string
	email: string
	password: string
	phone?: string
	country?: string
	currency?: string
}) {
	const username = normalizeUsername(input.username)
	const validation = validateUsername(username)
	if (validation) throw new Error(validation)

	const availability = await isUsernameAvailable(username)
	if (!availability.available) {
		throw new Error(availability.message ?? "Username is not available.")
	}

	const credential = await createUserWithEmailAndPassword(
		firebaseAuth,
		input.email.trim(),
		input.password
	)
	const user = credential.user

	if (!isAdminEmail(user.email)) {
		await sendEmailVerification(user, actionCodeSettings())
	}

	const sync = await syncUserProfile(user, {
		username,
		fullName: input.fullName.trim(),
		phone: input.phone,
		country: input.country,
		currency: input.currency,
	})

	if (!sync.success) {
		throw new Error(sync.message)
	}

	return user
}

const OAUTH_REDIRECT_KEY = "trackly-oauth-redirect"

function shouldPreferOAuthRedirect() {
	if (typeof window === "undefined") return false
	return /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent)
}

function markOAuthRedirectPending() {
	if (typeof window !== "undefined") {
		sessionStorage.setItem(OAUTH_REDIRECT_KEY, "1")
	}
}

async function signInWithProvider(
	provider: AuthProvider,
	options: { preferRedirect?: boolean } = {}
) {
	const preferRedirect = options.preferRedirect ?? shouldPreferOAuthRedirect()

	if (preferRedirect) {
		markOAuthRedirectPending()
		await signInWithRedirect(firebaseAuth, provider)
		return null
	}

	try {
		const result = await signInWithPopup(firebaseAuth, provider)
		return result.user
	} catch (error) {
		const code =
			error && typeof error === "object" && "code" in error
				? String((error as { code: string }).code)
				: ""

		if (
			code === "auth/popup-blocked" ||
			code === "auth/cancelled-popup-request" ||
			code === "auth/operation-not-supported-in-this-environment"
		) {
			markOAuthRedirectPending()
			await signInWithRedirect(firebaseAuth, provider)
			return null
		}

		throw error
	}
}

export async function signInWithGoogle() {
	const provider = new GoogleAuthProvider()
	provider.setCustomParameters({ prompt: "select_account" })
	// Desktop: popup. Mobile: redirect. Popup result must establish app session immediately.
	return signInWithProvider(provider, { preferRedirect: shouldPreferOAuthRedirect() })
}

export async function signInWithApple() {
	const provider = new OAuthProvider("apple.com")
	provider.addScope("email")
	provider.addScope("name")
	provider.setCustomParameters({ locale: "en" })
	return signInWithProvider(provider, { preferRedirect: true })
}

let oauthRedirectResultPromise: Promise<User | null> | null = null

function clearOAuthRedirectMarker() {
	if (typeof window !== "undefined") {
		sessionStorage.removeItem(OAUTH_REDIRECT_KEY)
	}
}

function cleanOAuthReturnUrl() {
	if (typeof window === "undefined") return
	const { origin, pathname, hash } = window.location
	const cleanedHash = hash.split("?")[0] || ""
	window.history.replaceState({}, document.title, `${origin}${pathname}${cleanedHash}`)
}

export function hadOAuthRedirectAttempt() {
	return hasPendingOAuthRedirect()
}

export async function consumeOAuthRedirectResult() {
	if (!oauthRedirectResultPromise) {
		oauthRedirectResultPromise = (async () => {
			const redirectAttempted = hadOAuthRedirectAttempt()
			const result = await getRedirectResult(firebaseAuth)
			let user = result?.user ?? firebaseAuth.currentUser

			if (!user && redirectAttempted) {
				await new Promise((resolve) => window.setTimeout(resolve, 400))
				user = firebaseAuth.currentUser
			}

			if (user) {
				clearOAuthRedirectMarker()
				cleanOAuthReturnUrl()
				return user
			}

			clearOAuthRedirectMarker()
			return null
		})()
	}
	return oauthRedirectResultPromise
}

export async function completeOAuthSignIn(user: User) {
	await user.reload()
	const exists = await profileExists(user.uid)
	if (!exists) {
		return { needsProfile: true as const, user }
	}
	await finalizeAuthenticatedUser(user)
	return { needsProfile: false as const, user }
}

export function hasPendingOAuthRedirect() {
	if (typeof window === "undefined") return false
	return sessionStorage.getItem(OAUTH_REDIRECT_KEY) === "1"
}

export async function completeOAuthProfile(
	user: User,
	input: { username: string; fullName: string; currency?: string }
) {
	const username = normalizeUsername(input.username)
	const validation = validateUsername(username)
	if (validation) throw new Error(validation)

	const availability = await isUsernameAvailable(username)
	if (!availability.available) {
		throw new Error(availability.message ?? "Username is not available.")
	}

	const sync = await syncUserProfile(user, {
		username,
		fullName: input.fullName.trim(),
		currency: input.currency,
	})

	if (!sync.success) {
		throw new Error(sync.message)
	}
}

export async function requestPasswordReset(identifier: string) {
	const email = await resolveLoginEmail(identifier)
	await sendPasswordResetEmail(firebaseAuth, email, actionCodeSettings())
}

export async function resendVerificationEmail(user: User) {
	await sendEmailVerification(user, actionCodeSettings())
}

export async function profileExists(userId: string) {
	const { data: authedData, error: authedError } = await supabase
		.from("profiles")
		.select("id")
		.eq("id", userId)
		.maybeSingle()

	if (!authedError && authedData) return true

	const { data, error } = await authSupabase
		.from("profiles")
		.select("id")
		.eq("id", userId)
		.maybeSingle()

	if (error) return false
	return Boolean(data)
}

export function requiresEmailVerification(user: User) {
	return !hasAppAccess(user)
}

export async function finalizeAuthenticatedUser(user: User) {
	await user.reload()
	const sync = await syncUserProfile(user)
	if (!sync.success) {
		throw new Error(sync.message)
	}
	await user.getIdToken(true)
}