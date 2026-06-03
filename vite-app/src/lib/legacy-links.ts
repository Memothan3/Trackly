import { tracklyConfig } from "@/lib/config"

export function getLegacyOrigin() {
	const configured = tracklyConfig.legacyAppUrl.trim().replace(/\/$/, "")
	if (configured && configured !== "same") {
		return configured
	}
	if (typeof window !== "undefined") {
		return window.location.origin
	}
	return ""
}

export function tracklyDashboardUrl(page?: string) {
	const origin = getLegacyOrigin()
	const base = `${origin}/app/`
	if (!page || page === "dashboard") {
		return base
	}
	return `${base}#/${encodeURIComponent(page)}`
}

export function classicDashboardUrl(page?: string) {
	const origin = getLegacyOrigin()
	const base = `${origin}/trackly_dashboard.html?classic=1`
	return page ? `${base}&page=${encodeURIComponent(page)}` : base
}

export function legacyAuthUrl() {
	return `${getLegacyOrigin()}/auth_fixed.html`
}
