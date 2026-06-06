import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@/components/ui/item"
import { formatDate } from "@/components/formater"
import { parseShoppingList } from "@/lib/shopping-list"
import { formatMoney } from "@/lib/trackly-metrics"
import type { TracklyTransaction } from "@/types/trackly"
import { cn } from "@/lib/utils"

type TransactionListProps = {
	transactions: TracklyTransaction[]
	currency: string
	limit?: number
	emptyTitle?: string
	emptyDescription?: string
	onDelete?: (transactionId: string) => void
}

export function TransactionList({
	transactions,
	currency,
	limit,
	emptyTitle = "No transactions yet",
	emptyDescription = "Add your first income or expense to see activity here.",
	onDelete,
}: TransactionListProps) {
	const rows = limit ? transactions.slice(0, limit) : transactions

	if (!rows.length) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Transactions</CardTitle>
					<CardDescription>{emptyDescription}</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">{emptyTitle}</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Transactions</CardTitle>
				<CardDescription>
					{limit ? `Latest ${rows.length} entries` : `${rows.length} entries`}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ItemGroup className="gap-2">
					{rows.map((txn) => (
						<TransactionRow
							currency={currency}
							key={txn.id}
							onDelete={onDelete}
							txn={txn}
						/>
					))}
				</ItemGroup>
			</CardContent>
		</Card>
	)
}

function TransactionRow({
	txn,
	currency,
	onDelete,
}: {
	txn: TracklyTransaction
	currency: string
	onDelete?: (transactionId: string) => void
}) {
	const isIncome = txn.type === "income"
	const isExpense = txn.type === "expense"
	const lineItems = parseShoppingList(txn.shopping_list)
	const amountLabel = `${isIncome ? "+" : isExpense ? "−" : ""}${formatMoney(Number(txn.amount), txn.currency ?? currency)}`

	return (
		<Item className="trackly-glass-sm" size="sm" variant="outline">
			<ItemContent>
				<ItemTitle className="flex items-center gap-2">
					<span className="truncate">{txn.reason || "Transaction"}</span>
					<Badge variant="outline">{txn.type}</Badge>
					{lineItems.length ? (
						<Badge variant="secondary">{lineItems.length} lines</Badge>
					) : null}
				</ItemTitle>
				<ItemDescription className="line-clamp-3">
					{txn.categories?.name ? `${txn.categories.name} · ` : ""}
					{formatDate(txn.date.split("T")[0], "full")}
					{lineItems.length ? (
						<span className="mt-1 block text-xs">
							{lineItems
								.slice(0, 3)
								.map((line) => `${line.name} (${line.quantity}×${line.price})`)
								.join(" · ")}
							{lineItems.length > 3 ? ` · +${lineItems.length - 3} more` : ""}
						</span>
					) : txn.note ? (
						` · ${txn.note}`
					) : null}
				</ItemDescription>
			</ItemContent>
			<ItemActions className="flex shrink-0 items-center gap-2">
				<span
					className={cn(
						"font-medium text-sm tabular-nums",
						isIncome && "text-primary",
						isExpense && "text-destructive"
					)}
				>
					{amountLabel}
				</span>
				{onDelete ? (
					<Button
						onClick={() => {
							if (
								confirm(
									"Delete this transaction? Account balances will be adjusted."
								)
							) {
								onDelete(txn.id)
							}
						}}
						size="sm"
						type="button"
						variant="ghost"
					>
						Delete
					</Button>
				) : null}
			</ItemActions>
		</Item>
	)
}