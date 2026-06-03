import { formatMoney } from "@/lib/trackly-metrics"
import type { TracklyBudget, TracklyTransaction } from "@/types/trackly"

export type BudgetProgress = {
	id: string
	category: string
	spent: number
	limit: number
	percent: number
	status: "ok" | "warn" | "over"
	spentLabel: string
	limitLabel: string
}

export function buildBudgetProgress(
	budgets: TracklyBudget[],
	transactions: TracklyTransaction[],
	currency: string
): BudgetProgress[] {
	const monthStart = new Date()
	monthStart.setDate(1)
	monthStart.setHours(0, 0, 0, 0)

	const monthExpenses = transactions.filter((t) => {
		if (t.type !== "expense") {
			return false
		}
		return new Date(t.date) >= monthStart
	})

	return budgets.map((budget) => {
		const spent = monthExpenses
			.filter((t) => (t.category_id || "") === (budget.category_id || ""))
			.reduce((sum, t) => sum + Number(t.amount || 0), 0)
		const limit = Number(budget.limit_amount ?? budget.amount ?? 0)
		const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0
		const status = percent >= 100 ? "over" : percent >= 80 ? "warn" : "ok"

		return {
			id: budget.id,
			category: budget.categories?.name ?? "Category",
			spent,
			limit,
			percent,
			status,
			spentLabel: formatMoney(spent, currency),
			limitLabel: formatMoney(limit, currency),
		}
	})
}