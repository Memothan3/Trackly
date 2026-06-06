const base = import.meta.env.BASE_URL.endsWith("/")
	? import.meta.env.BASE_URL
	: `${import.meta.env.BASE_URL}/`

export const brandAssets = {
	icon: `${base}logo-icon.png`,
	full: `${base}logo-full.png`,
} as const