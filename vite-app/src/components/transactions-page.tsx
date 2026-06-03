import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { TransactionList } from "@/components/transaction-list"
import { useTrackly } from "@/contexts/trackly-provider"
import type { TracklyTransaction } from "@/types/trackly"

const FILTER_TYPES = ["all", "income", "expense", "transfer"] as const

export function TransactionsPage() {
	const { transactions, currency, setAddTransactionOpen, removeTransaction } =
		useTrackly()
	const [query, setQuery] = useState("")
	const [typeFilter, setTypeFilter] =
		useState<(typeof FILTER_TYPES)[number]>("all")

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase()
		return transactions.filter((t) => {
			if (typeFilter !== "all" && t.type !== typeFilter) return false
			if (!q) return true
			const hay = [
				t.reason,
				t.note,
				t.categories?.name,
				t.type,
				String(t.amount),
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase()
			return hay.includes(q)
		})
	}, [transactions, query, typeFilter])

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="font-semibold text-2xl tracking-tight">Transactions</h1>
					<p className="text-muted-foreground text-sm">
						{filtered.length} of {transactions.length} entries from Supabase.
					</p>
				</div>
				<Button onClick={() => setAddTransactionOpen(true)}>Add transaction</Button>
			</div>

			<div className="flex flex-col gap-2 sm:flex-row">
				<Input
					className="sm:max-w-sm"
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search reason, note, category…"
					value={query}
				/>
				<Select
					onValueChange={(v) =>
						setTypeFilter(v as (typeof FILTER_TYPES)[number])
					}
					value={typeFilter}
				>
					<SelectTrigger className="w-full sm:w-[180px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{FILTER_TYPES.map((t) => (
							<SelectItem key={t} value={t}>
								{t === "all" ? "All types" : t}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<TransactionList
				currency={currency}
				emptyDescription="Try adjusting filters or add a new transaction."
				emptyTitle="No matching transactions"
				onDelete={(id) => {
					void removeTransaction(id)
				}}
				transactions={filtered as TracklyTransaction[]}
			/>
		</div>
	)
}