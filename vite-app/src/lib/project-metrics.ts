import { formatMoney } from "@/lib/trackly-metrics"
import type { TracklyProject, TracklyTransaction } from "@/types/trackly"

export type ProjectSummary = {
	id: string
	name: string
	description: string
	budget: number
	income: number
	expense: number
	balance: number
	budgetUsedPercent: number
	incomeLabel: string
	expenseLabel: string
	balanceLabel: string
	budgetLabel: string
}

export function buildProjectSummary(
	project: TracklyProject,
	transactions: TracklyTransaction[],
	currency: string
): ProjectSummary {
	const projectTxns = transactions.filter((t) => t.project_id === project.id)
	const income = projectTxns
		.filter((t) => t.type === "income")
		.reduce((sum, t) => sum + Number(t.amount), 0)
	const expense = projectTxns
		.filter((t) => t.type === "expense")
		.reduce((sum, t) => sum + Number(t.amount), 0)
	const budget = Number(project.budget ?? 0)
	const balance = budget + income - expense
	const budgetUsedPercent = budget > 0 ? Math.min(100, Math.round((expense / budget) * 100)) : 0

	return {
		id: project.id,
		name: project.name,
		description: project.description?.trim() ?? "",
		budget,
		income,
		expense,
		balance,
		budgetUsedPercent,
		incomeLabel: formatMoney(income, currency),
		expenseLabel: formatMoney(expense, currency),
		balanceLabel: formatMoney(balance, currency),
		budgetLabel: formatMoney(budget, currency),
	}
}

export function filterProjectTransactions(
	projectId: string,
	transactions: TracklyTransaction[]
) {
	return transactions.filter((t) => t.project_id === projectId)
}