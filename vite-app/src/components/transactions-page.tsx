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
import { PageHeader } from "@/components/page-header"
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
			<PageHeader
				action={
					<Button onClick={() => setAddTransactionOpen(true)}>
						Add transaction
					</Button>
				}
				description={`${filtered.length} of ${transactions.length} entries from Supabase.`}
				title="Transactions"
			/>

			<div className="trackly-glass sticky top-[calc(3.25rem+0.75rem)] z-10 flex flex-col gap-2 rounded-2xl p-3 sm:static sm:flex-row sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
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