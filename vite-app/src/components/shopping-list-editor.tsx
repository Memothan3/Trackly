"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	createShoppingRow,
	getShoppingGrandTotal,
	recalcShoppingRow,
	type ShoppingListItem,
} from "@/lib/shopping-list"
import { formatMoney } from "@/lib/trackly-metrics"

type ShoppingListEditorProps = {
	items: ShoppingListItem[]
	currency: string
	onChange: (items: ShoppingListItem[]) => void
}

export function ShoppingListEditor({
	items,
	currency,
	onChange,
}: ShoppingListEditorProps) {
	const grandTotal = getShoppingGrandTotal(items)

	function updateRow(id: string, patch: Partial<ShoppingListItem>) {
		onChange(
			items.map((item) =>
				item.id === id ? recalcShoppingRow({ ...item, ...patch }) : item
			)
		)
	}

	return (
		<div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/20 p-3">
			<div className="flex items-center justify-between gap-2">
				<span className="font-medium text-sm">Shopping list</span>
				<Button
					onClick={() => onChange([...items, createShoppingRow()])}
					size="sm"
					type="button"
					variant="outline"
				>
					Add item
				</Button>
			</div>
			<div className="hidden gap-2 px-1 text-muted-foreground text-xs uppercase tracking-wide sm:grid sm:grid-cols-[1fr_72px_88px_88px_40px]">
				<span>Item</span>
				<span>Qty</span>
				<span>Price</span>
				<span>Total</span>
				<span />
			</div>
			<div className="flex flex-col gap-2">
				{items.map((item) => (
					<div
						className="grid grid-cols-1 gap-2 rounded-lg border border-border/40 bg-card/80 p-2 sm:grid-cols-[1fr_72px_88px_88px_40px] sm:items-center sm:gap-2 sm:border-0 sm:bg-transparent sm:p-0"
						key={item.id}
					>
						<Input
							onChange={(e) => updateRow(item.id, { name: e.target.value })}
							placeholder="Item name"
							value={item.name}
						/>
						<Input
							min="0"
							onChange={(e) =>
								updateRow(item.id, {
									quantity: Number.parseFloat(e.target.value) || 0,
								})
							}
							placeholder="Qty"
							step="1"
							type="number"
							value={item.quantity || ""}
						/>
						<Input
							min="0"
							onChange={(e) =>
								updateRow(item.id, {
									price: Number.parseFloat(e.target.value) || 0,
								})
							}
							placeholder="Price"
							step="0.01"
							type="number"
							value={item.price || ""}
						/>
						<span className="text-sm tabular-nums">
							{item.total.toFixed(2)}
						</span>
						<Button
							className="justify-self-end sm:justify-self-auto"
							onClick={() =>
								onChange(items.filter((row) => row.id !== item.id))
							}
							size="icon"
							type="button"
							variant="ghost"
						>
							×
						</Button>
					</div>
				))}
			</div>
			<p className="text-end font-medium text-primary text-sm tabular-nums">
				Total: {formatMoney(grandTotal, currency)}
			</p>
		</div>
	)
}