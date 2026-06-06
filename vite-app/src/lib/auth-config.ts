import { tracklyConfig } from "@/lib/config"

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