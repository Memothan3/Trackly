const base = import.meta.env.BASE_URL.endsWith("/")
	? import.meta.env.BASE_URL
	: `${import.meta.env.BASE_URL}/`

/** Bump when logo PNGs change so browsers bypass SW/asset cache. */
export const BRAND_LOGO_VERSION = "20260607-v1"

function brandAsset(path: string) {
	return `${base}${path}?v=${BRAND_LOGO_VERSION}`
}

/** Primary wordmark used across the app UI. */
export const brandAssets = {
	/** White wordmark — dark backgrounds / dark theme. */
	full: brandAsset("logo-full2.png"),
	/** Black wordmark — light backgrounds / light theme. */
	fullOnLight: brandAsset("black-logo.png"),
	/** Square mark — favicon / PWA only; UI uses `full`. */
	icon: brandAsset("logo-icon.png"),
} as const