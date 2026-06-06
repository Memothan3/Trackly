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
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { filterCategoriesByTxnType } from "@/lib/categories"
import { buildBudgetProgress } from "@/lib/budget-metrics"
import { useTrackly } from "@/contexts/trackly-provider"
import { cn } from "@/lib/utils"

const PERIODS = ["monthly", "weekly", "yearly"]

export function BudgetsPage() {
	const {
		budgets,
		categories,
		transactions,
		currency,
		addBudget,
		removeBudget,
	} = useTrackly()
	const progress = buildBudgetProgress(budgets, transactions, currency)

	const expenseCategories = useMemo(
		() => filterCategoriesByTxnType(categories, "expense"),
		[categories]
	)

	const [categoryId, setCategoryId] = useState("")
	const [limitAmount, setLimitAmount] = useState("")
	const [period, setPeriod] = useState("monthly")
	const [submitting, setSubmitting] = useState(false)
	const [formError, setFormError] = useState<string | null>(null)

	async function handleAdd(event: React.FormEvent) {
		event.preventDefault()
		const parsed = Number.parseFloat(limitAmount)
		if (!categoryId) {
			setFormError("Select a category.")
			return
		}
		if (!parsed || parsed <= 0) {
			setFormError("Enter a valid limit amount.")
			return
		}
		setSubmitting(true)
		setFormError(null)
		try {
			await addBudget({
				categoryId,
				limitAmount: parsed,
				period,
			})
			setLimitAmount("")
			setCategoryId("")
		} catch (err) {
			setFormError(err instanceof Error ? err.message : "Could not create budget")
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="flex flex-col gap-4">
			<PageHeader
				description="Set category limits and track month-to-date spending from Supabase."
				title="Budgets"
			/>

			<Card>
				<CardHeader>
					<CardTitle>Add budget</CardTitle>
					<CardDescription>
						One active budget per category; spending updates as you log expenses.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
						onSubmit={handleAdd}
					>
						<Select onValueChange={setCategoryId} value={categoryId}>
							<SelectTrigger>
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								{expenseCategories.map((c) => (
									<SelectItem key={c.id} value={c.id}>
										{c.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Input
							min="0"
							onChange={(e) => setLimitAmount(e.target.value)}
							placeholder="Limit amount"
							step="0.01"
							type="number"
							value={limitAmount}
						/>
						<Select onValueChange={setPeriod} value={period}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{PERIODS.map((p) => (
									<SelectItem key={p} value={p}>
										{p}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button disabled={submitting || !expenseCategories.length} type="submit">
							{submitting ? "Saving…" : "Create budget"}
						</Button>
					</form>
					{formError ? (
						<p className="mt-2 text-destructive text-sm">{formError}</p>
					) : null}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Active budgets</CardTitle>
					<CardDescription>Progress for the current calendar month</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-5">
					{!progress.length ? (
						<p className="text-muted-foreground text-sm">
							No active budgets yet. Create one above to start tracking limits.
						</p>
					) : (
						progress.map((row) => (
							<div className="flex flex-col gap-2" key={row.id}>
								<div className="flex flex-wrap items-center justify-between gap-2">
									<span className="font-medium">{row.category}</span>
									<div className="flex items-center gap-2">
										<span className="text-muted-foreground text-sm tabular-nums">
											{row.spentLabel} / {row.limitLabel} ({row.percent}%)
										</span>
										<Button
											onClick={() => {
												if (confirm("Remove this budget?")) {
													void removeBudget(row.id)
												}
											}}
											size="sm"
											type="button"
											variant="ghost"
										>
											Remove
										</Button>
									</div>
								</div>
								<div className="h-2 overflow-hidden rounded-full bg-muted">
									<div
										className={cn(
											"h-full rounded-full transition-all",
											row.status === "over" && "bg-destructive",
											row.status === "warn" && "bg-primary/80",
											row.status === "ok" && "bg-primary"
										)}
										style={{ width: `${row.percent}%` }}
									/>
								</div>
							</div>
						))
					)}
				</CardContent>
			</Card>
		</div>
	)
}