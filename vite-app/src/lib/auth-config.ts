import type { User } from "firebase/auth"
import { tracklyConfig } from "@/lib/config"

/**
 * OAuth redirect URI for Apple Sign In (and other Firebase OAuth providers).
 * Register this exact URL in Apple Developer → Identifiers → Services ID →
 * Sign in with Apple → Return URLs.
 */
export function getFirebaseOAuthHandlerUrl() {
	const domain = tracklyConfig.firebase.authDomain.replace(/\/$/, "")
	return `https://${domain}/__/auth/handler`
}

export function getAuthContinueUrl() {
	if (typeof window === "undefined") {
		return "/app/"
	}
	const base = import.meta.env.BASE_URL.replace(/\/$/, "") || "/app"
	return `${window.location.origin}${base}/`
}

/** Where authenticated users land after email actions or OAuth. */
export function getPostLoginRedirectUrl() {
	return getAuthContinueUrl()
}

export function isAdminEmail(email: string | null | undefined) {
	return (
		email?.toLowerCase() === tracklyConfig.adminEmail.toLowerCase()
	)
}

const OAUTH_PROVIDER_IDS = new Set(["google.com", "apple.com"])

export function isOAuthUser(user: User) {
	if (
		user.providerData.some((provider) =>
			OAUTH_PROVIDER_IDS.has(provider.providerId)
		)
	) {
		return true
	}

	// Provider metadata can lag right after redirect sign-in.
	const usesPasswordProvider = user.providerData.some(
		(provider) => provider.providerId === "password"
	)
	if (usesPasswordProvider) return false

	if (user.emailVerified && Boolean(user.email?.includes("@"))) {
		return true
	}

	return Boolean(user.email?.includes("@")) && !usesPasswordProvider
}

export function hasAppAccess(user: User | null | undefined) {
	if (!user) return false
	return (
		user.emailVerified ||
		isAdminEmail(user.email) ||
		isOAuthUser(user)
	)
}

export const USERNAME_PATTERN = /^[a-z0-9_]+$/

export function normalizeUsername(value: string) {
	return value.trim().toLowerCase()
}

export function validateUsername(username: string) {
	if (!username) return "Username is required."
	if (username.length < 3) return "Username must be at least 3 characters."
	if (!USERNAME_PATTERN.test(username)) {
		return "Username can only use lowercase letters, numbers, and underscores."
	}
	return null
}