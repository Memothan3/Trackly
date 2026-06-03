import { useCallback, useSyncExternalStore } from "react"

export type AppRoute =
	| "dashboard"
	| "transactions"
	| "accounts"
	| "budgets"
	| "insights"
	| "scheduled"
	| "receipts"
	| "projects"
	| "ai"
	| "export"
	| "admin"
	| "settings"

const ROUTES: AppRoute[] = [
	"dashboard",
	"transactions",
	"accounts",
	"budgets",
	"insights",
	"scheduled",
	"receipts",
	"projects",
	"ai",
	"export",
	"admin",
	"settings",
]

function parseRoute(): AppRoute {
	const hash = window.location.hash.replace(/^#\/?/, "").split("?")[0]
	if (ROUTES.includes(hash as AppRoute)) {
		return hash as AppRoute
	}
	return "dashboard"
}

function subscribe(onStoreChange: () => void) {
	window.addEventListener("hashchange", onStoreChange)
	return () => window.removeEventListener("hashchange", onStoreChange)
}

export function appRouteHref(route: AppRoute) {
	return route === "dashboard" ? "#/" : `#/${route}`
}

export function useAppRoute() {
	const route = useSyncExternalStore(subscribe, parseRoute, () => "dashboard" as AppRoute)

	const navigate = useCallback((next: AppRoute) => {
		window.location.hash = appRouteHref(next)
	}, [])

	return { route, navigate }
}