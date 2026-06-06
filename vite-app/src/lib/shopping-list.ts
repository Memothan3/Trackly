import type { TracklyCategory } from "@/types/trackly"

export type ShoppingListItem = {
	id: string
	name: string
	categoryId?: string
	quantity: number
	price: number
	total: number
}

export function isShoppingCategory(category: TracklyCategory | undefined) {
	if (!category?.name) return false
	const name = category.name.toLowerCase()
	return /purchase|shopping|grocery|retail|market|store/.test(name)
}

export function createShoppingRow(categoryId = ""): ShoppingListItem {
	return {
		id: crypto.randomUUID(),
		name: "",
		categoryId,
		quantity: 1,
		price: 0,
		total: 0,
	}
}

export function recalcShoppingRow(item: ShoppingListItem): ShoppingListItem {
	const quantity = Math.max(0, Number(item.quantity) || 0)
	const price = Math.max(0, Number(item.price) || 0)
	return {
		...item,
		quantity,
		price,
		total: quantity * price,
	}
}

export function getShoppingGrandTotal(items: ShoppingListItem[]) {
	return items
		.filter((item) => item.name.trim())
		.reduce((sum, item) => sum + item.total, 0)
}

export function getValidShoppingItems(items: ShoppingListItem[]) {
	return items.filter((item) => item.name.trim()).map(recalcShoppingRow)
}

export function resolvePrimaryCategoryId(items: ShoppingListItem[]) {
	const valid = getValidShoppingItems(items)
	if (!valid.length) return null

	const totals = new Map<string, number>()
	for (const item of valid) {
		if (!item.categoryId) continue
		totals.set(item.categoryId, (totals.get(item.categoryId) ?? 0) + item.total)
	}
	if (!totals.size) return valid[0]?.categoryId || null

	let bestId: string | null = null
	let bestTotal = -1
	for (const [id, total] of totals) {
		if (total > bestTotal) {
			bestTotal = total
			bestId = id
		}
	}
	return bestId
}

export function parseShoppingList(
	raw: string | null | undefined
): ShoppingListItem[] {
	if (!raw) return []
	try {
		const parsed = JSON.parse(raw) as unknown
		if (!Array.isArray(parsed)) return []
		return parsed
			.filter((row) => row && typeof row === "object")
			.map((row) => {
				const item = row as Partial<ShoppingListItem>
				return recalcShoppingRow({
					id: item.id ?? crypto.randomUUID(),
					name: String(item.name ?? ""),
					categoryId: item.categoryId ? String(item.categoryId) : undefined,
					quantity: Number(item.quantity) || 0,
					price: Number(item.price) || 0,
					total: Number(item.total) || 0,
				})
			})
	} catch {
		return []
	}
}

export function formatShoppingNote(
	items: ShoppingListItem[],
	currency: string,
	categories?: TracklyCategory[]
) {
	const valid = getValidShoppingItems(items)
	if (!valid.length) return null

	const categoryName = (id?: string) =>
		categories?.find((c) => c.id === id)?.name ?? "Uncategorized"

	const lines = valid.map((item) => {
		const label = item.categoryId
			? `[${categoryName(item.categoryId)}] `
			: ""
		return `• ${label}${item.name} (${item.quantity}× ${item.price.toFixed(2)}) = ${item.total.toFixed(2)} ${currency}`
	})
	return `Line items:\n${lines.join("\n")}`
}