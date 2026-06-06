import type { TracklyCategory } from "@/types/trackly"

function categoryKey(category: TracklyCategory) {
	const name = (category.name ?? "").trim().toLowerCase()
	const type = (category.type ?? "expense").trim().toLowerCase()
	return `${type}:${name}`
}

function categoryRank(category: TracklyCategory) {
	if (category.user_id && !category.is_default) return 2
	if (category.user_id) return 1
	return 0
}

/** Collapse default + custom rows that share the same name and type. */
export function dedupeCategories(categories: TracklyCategory[]) {
	const best = new Map<string, TracklyCategory>()

	for (const category of categories) {
		const key = categoryKey(category)
		if (!key.endsWith(":") && key.length > 1) {
			const existing = best.get(key)
			if (!existing || categoryRank(category) > categoryRank(existing)) {
				best.set(key, category)
			}
		}
	}

	return [...best.values()].sort((a, b) =>
		(a.name ?? "").localeCompare(b.name ?? "", undefined, { sensitivity: "base" })
	)
}

export function filterCategoriesByTxnType(
	categories: TracklyCategory[],
	type: "income" | "expense" | "transfer"
) {
	const deduped = dedupeCategories(categories)
	if (type === "income") {
		return deduped.filter((c) => c.type !== "expense")
	}
	if (type === "expense") {
		return deduped.filter((c) => c.type !== "income")
	}
	return deduped
}