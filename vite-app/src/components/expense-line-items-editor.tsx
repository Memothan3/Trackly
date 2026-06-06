"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	createShoppingRow,
	getShoppingGrandTotal,
	recalcShoppingRow,
	type ShoppingListItem,
} from "@/lib/shopping-list"
import { formatMoney } from "@/lib/trackly-metrics"
import type { TracklyCategory } from "@/types/trackly"
import { PlusIcon, Trash2Icon } from "lucide-react"

type ExpenseLineItemsEditorProps = {
	items: ShoppingListItem[]
	categories: TracklyCategory[]
	currency: string
	onChange: (items: ShoppingListItem[]) => void
}

function LineItemFields({
	item,
	index,
	categories,
	onUpdate,
	onRemove,
	canRemove,
}: {
	item: ShoppingListItem
	index: number
	categories: TracklyCategory[]
	onUpdate: (patch: Partial<ShoppingListItem>) => void
	onRemove: () => void
	canRemove: boolean
}) {
	return (
		<>
			<Input
				onChange={(e) => onUpdate({ name: e.target.value })}
				placeholder={`Line ${index + 1}`}
				value={item.name}
			/>
			<Select
				onValueChange={(v) =>
					onUpdate({ categoryId: v === "__none__" ? "" : v })
				}
				value={item.categoryId || "__none__"}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Category" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="__none__">Uncategorized</SelectItem>
					{categories.map((c) => (
						<SelectItem key={c.id} value={c.id}>
							{c.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<div className="grid grid-cols-3 gap-2">
				<div className="flex flex-col gap-1">
					<span className="text-muted-foreground text-xs">Qty</span>
					<Input
						min="0"
						onChange={(e) =>
							onUpdate({
								quantity: Number.parseFloat(e.target.value) || 0,
							})
						}
						placeholder="1"
						step="1"
						type="number"
						value={item.quantity || ""}
					/>
				</div>
				<div className="flex flex-col gap-1">
					<span className="text-muted-foreground text-xs">Unit</span>
					<Input
						min="0"
						onChange={(e) =>
							onUpdate({
								price: Number.parseFloat(e.target.value) || 0,
							})
						}
						placeholder="0.00"
						step="0.01"
						type="number"
						value={item.price || ""}
					/>
				</div>
				<div className="flex flex-col gap-1">
					<span className="text-muted-foreground text-xs">Total</span>
					<div className="flex h-9 items-center justify-end rounded-3xl border border-white/10 bg-white/5 px-3 font-medium text-sm tabular-nums">
						{item.total.toFixed(2)}
					</div>
				</div>
			</div>
			<div className="flex justify-end">
				<Button
					aria-label="Remove row"
					disabled={!canRemove}
					onClick={onRemove}
					size="sm"
					type="button"
					variant="ghost"
				>
					<Trash2Icon className="size-3.5" />
					Remove
				</Button>
			</div>
		</>
	)
}

export function ExpenseLineItemsEditor({
	items,
	categories,
	currency,
	onChange,
}: ExpenseLineItemsEditorProps) {
	const grandTotal = getShoppingGrandTotal(items)

	function updateRow(id: string, patch: Partial<ShoppingListItem>) {
		onChange(
			items.map((item) =>
				item.id === id ? recalcShoppingRow({ ...item, ...patch }) : item
			)
		)
	}

	return (
		<div className="trackly-glass flex flex-col gap-3 overflow-hidden rounded-2xl p-3 sm:p-4">
			<div className="flex items-center justify-between gap-2">
				<div>
					<p className="font-medium text-sm">Expense breakdown</p>
					<p className="text-muted-foreground text-xs">
						Classify each line — unit price × quantity auto-sums the total.
					</p>
				</div>
				<Button
					onClick={() => onChange([...items, createShoppingRow()])}
					size="sm"
					type="button"
					variant="outline"
				>
					<PlusIcon className="size-3.5" />
					Add row
				</Button>
			</div>

			<div className="flex flex-col gap-2 sm:hidden">
				{items.map((item, index) => (
					<div
						className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/10 p-3"
						key={item.id}
					>
						<LineItemFields
							canRemove={items.length > 1}
							categories={categories}
							index={index}
							item={item}
							onRemove={() =>
								onChange(items.filter((row) => row.id !== item.id))
							}
							onUpdate={(patch) => updateRow(item.id, patch)}
						/>
					</div>
				))}
				<div className="flex items-center justify-between rounded-xl border border-white/12 bg-white/[0.06] px-3 py-2.5">
					<span className="font-semibold text-sm">Grand total</span>
					<span className="font-semibold text-primary text-sm tabular-nums">
						{formatMoney(grandTotal, currency)}
					</span>
				</div>
			</div>

			<div className="hidden overflow-x-auto rounded-xl border border-white/10 bg-black/10 sm:block">
				<table className="w-full min-w-[640px] border-collapse text-sm">
					<thead>
						<tr className="border-white/10 border-b bg-white/5 text-muted-foreground text-xs uppercase tracking-wide">
							<th className="px-2 py-2 text-start font-medium">Item</th>
							<th className="px-2 py-2 text-start font-medium">Category</th>
							<th className="w-[72px] px-2 py-2 text-end font-medium">Qty</th>
							<th className="w-[96px] px-2 py-2 text-end font-medium">Unit</th>
							<th className="w-[96px] px-2 py-2 text-end font-medium">Total</th>
							<th className="w-10 px-2 py-2" />
						</tr>
					</thead>
					<tbody>
						{items.map((item, index) => (
							<tr
								className="border-white/8 border-b last:border-b-0 hover:bg-white/[0.03]"
								key={item.id}
							>
								<td className="px-2 py-1.5 align-middle">
									<Input
										className="h-8 rounded-lg bg-white/5 text-sm"
										onChange={(e) =>
											updateRow(item.id, { name: e.target.value })
										}
										placeholder={`Line ${index + 1}`}
										value={item.name}
									/>
								</td>
								<td className="px-2 py-1.5 align-middle">
									<Select
										onValueChange={(v) =>
											updateRow(item.id, {
												categoryId: v === "__none__" ? "" : v,
											})
										}
										value={item.categoryId || "__none__"}
									>
										<SelectTrigger className="h-8 w-full min-w-[120px] rounded-lg bg-white/5 text-xs">
											<SelectValue placeholder="Category" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="__none__">Uncategorized</SelectItem>
											{categories.map((c) => (
												<SelectItem key={c.id} value={c.id}>
													{c.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</td>
								<td className="px-2 py-1.5 align-middle">
									<Input
										className="h-8 rounded-lg bg-white/5 text-end text-sm tabular-nums"
										min="0"
										onChange={(e) =>
											updateRow(item.id, {
												quantity: Number.parseFloat(e.target.value) || 0,
											})
										}
										placeholder="1"
										step="1"
										type="number"
										value={item.quantity || ""}
									/>
								</td>
								<td className="px-2 py-1.5 align-middle">
									<Input
										className="h-8 rounded-lg bg-white/5 text-end text-sm tabular-nums"
										min="0"
										onChange={(e) =>
											updateRow(item.id, {
												price: Number.parseFloat(e.target.value) || 0,
											})
										}
										placeholder="0.00"
										step="0.01"
										type="number"
										value={item.price || ""}
									/>
								</td>
								<td className="px-2 py-1.5 text-end align-middle font-medium text-sm tabular-nums">
									{item.total.toFixed(2)}
								</td>
								<td className="px-2 py-1.5 text-center align-middle">
									<Button
										aria-label="Remove row"
										className="size-8"
										disabled={items.length <= 1}
										onClick={() =>
											onChange(items.filter((row) => row.id !== item.id))
										}
										size="icon"
										type="button"
										variant="ghost"
									>
										<Trash2Icon className="size-3.5" />
									</Button>
								</td>
							</tr>
						))}
					</tbody>
					<tfoot>
						<tr className="border-white/12 border-t bg-white/[0.06]">
							<td
								className="px-3 py-2.5 text-end font-semibold text-sm"
								colSpan={4}
							>
								Grand total
							</td>
							<td
								className="px-2 py-2.5 text-end font-semibold text-primary text-sm tabular-nums"
								colSpan={2}
							>
								{formatMoney(grandTotal, currency)}
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	)
}