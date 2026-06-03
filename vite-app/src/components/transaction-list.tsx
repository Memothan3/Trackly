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
				<ItemGroup className="gap-0">
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
	const amountLabel = `${isIncome ? "+" : isExpense ? "−" : ""}${formatMoney(Number(txn.amount), txn.currency ?? currency)}`

	return (
		<Item size="sm">
			<ItemContent>
				<ItemTitle className="flex items-center gap-2">
					<span className="truncate">{txn.reason || "Transaction"}</span>
					<Badge variant="outline">{txn.type}</Badge>
				</ItemTitle>
				<ItemDescription className="line-clamp-2">
					{txn.categories?.name ? `${txn.categories.name} · ` : ""}
					{formatDate(txn.date.split("T")[0], "full")}
					{txn.note ? ` · ${txn.note}` : ""}
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