import type { TracklyCategory } from "@/types/trackly"

export type ShoppingListItem = {
	id: string
	name: string
	quantity: number
	price: number
	total: number
}

export function isShoppingCategory(category: TracklyCategory | undefined) {
	if (!category?.name) return false
	const name = category.name.toLowerCase()
	return /purchase|shopping|grocery|retail|market|store/.test(name)
}

export function createShoppingRow(): ShoppingListItem {
	return {
		id: crypto.randomUUID(),
		name: "",
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

export function formatShoppingNote(items: ShoppingListItem[], currency: string) {
	const valid = getValidShoppingItems(items)
	if (!valid.length) return null
	const lines = valid.map(
		(item) =>
			`• ${item.name} (${item.quantity}× ${item.price.toFixed(2)}) = ${item.total.toFixed(2)} ${currency}`
	)
	return `Shopping list:\n${lines.join("\n")}`
}