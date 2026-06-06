const base = import.meta.env.BASE_URL.endsWith("/")
	? import.meta.env.BASE_URL
	: `${import.meta.env.BASE_URL}/`

/** Primary wordmark used across the app UI. */
export const brandAssets = {
	full: `${base}logo-full.png`,
	/** Square mark — favicon / PWA only; UI uses `full`. */
	icon: `${base}logo-icon.png`,
} as const