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

export function appUrl(page?: string) {
	return tracklyDashboardUrl(page)
}

/** @deprecated Use appUrl() — classic HTML dashboards were retired. */
export function classicDashboardUrl(page?: string) {
	return tracklyDashboardUrl(page)
}

export function legacyAuthUrl() {
	return tracklyDashboardUrl()
}
