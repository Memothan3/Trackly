import { formatFullCurrency, formatPercent } from "@/components/formater"
import type {
	CategoryMixDatum,
	DashboardStat,
	ExpenseTrendRow,
	IncomeChartRow,
	TracklyAccount,
	TracklyTransaction,
} from "@/types/trackly"

function toCurrencyPrefix(code: string) {
	return code.toUpperCase() === "USD" ? "$" : `${code.toUpperCase()} `
}

export function formatMoney(amount: number, currency = "USD") {
	const prefix = toCurrencyPrefix(currency)
	return `${prefix}${Math.abs(amount).toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`
}

function isoDate(d: Date) {
	return d.toISOString().split("T")[0]
}

function inRange(date: string, start: Date, end: Date) {
	const value = new Date(`${date}T12:00:00`)
	return value >= start && value <= end
}

function sumByType(transactions: TracklyTransaction[], type: TracklyTransaction["type"]) {
	return transactions
		.filter((t) => t.type === type)
		.reduce((sum, t) => sum + Number(t.amount), 0)
}

function pctDelta(current: number, previous: number) {
	if (!previous) {
		return current ? 100 : 0
	}
	return ((current - previous) / previous) * 100
}

function periodTotals(transactions: TracklyTransaction[], start: Date, end: Date) {
	const rows = transactions.filter((t) => inRange(t.date, start, end))
	return {
		income: sumByType(rows, "income"),
		expense: sumByType(rows, "expense"),
		count: rows.length,
	}
}

export function buildDashboardStats(
	accounts: TracklyAccount[],
	transactions: TracklyTransaction[],
	currency: string
): DashboardStat[] {
	const now = new Date()
	const currentStart = new Date(now)
	currentStart.setDate(currentStart.getDate() - 29)
	const priorEnd = new Date(currentStart)
	priorEnd.setDate(priorEnd.getDate() - 1)
	const priorStart = new Date(priorEnd)
	priorStart.setDate(priorStart.getDate() - 29)

	const current = periodTotals(transactions, currentStart, now)
	const prior = periodTotals(transactions, priorStart, priorEnd)
	const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0)
	const savingsRate =
		current.income > 0
			? ((current.income - current.expense) / current.income) * 100
			: 0
	const priorSavingsRate =
		prior.income > 0 ? ((prior.income - prior.expense) / prior.income) * 100 : 0

	return [
		{
			label: "Total balance",
			value: formatMoney(totalBalance, currency),
			delta: 0,
			hint: `${accounts.length} active account${accounts.length === 1 ? "" : "s"}`,
		},
		{
			label: "Income (30d)",
			value: formatMoney(current.income, currency),
			delta: pctDelta(current.income, prior.income),
			hint: "vs prior 30 days",
		},
		{
			label: "Expenses (30d)",
			value: formatMoney(current.expense, currency),
			delta: pctDelta(current.expense, prior.expense),
			hint: "vs prior 30 days",
		},
		{
			label: "Savings rate",
			value: formatPercent(savingsRate, 1),
			delta: savingsRate - priorSavingsRate,
			hint: "vs prior 30 days",
		},
	]
}

export function buildIncomeChartData(
	transactions: TracklyTransaction[],
	days: number
): IncomeChartRow[] {
	const rows: IncomeChartRow[] = []
	const today = new Date()

	for (let i = days - 1; i >= 0; i -= 1) {
		const day = new Date(today)
		day.setDate(day.getDate() - i)
		const key = isoDate(day)
		const income = transactions
			.filter((t) => t.type === "income" && t.date === key)
			.reduce((sum, t) => sum + Number(t.amount), 0)
		rows.push({ date: key, revenue: income })
	}

	return rows
}

export function buildExpenseTrendData(transactions: TracklyTransaction[]): {
	rows: ExpenseTrendRow[]
	dailyAverage: number
} {
	const rows: ExpenseTrendRow[] = []
	const today = new Date()

	for (let i = 6; i >= 0; i -= 1) {
		const day = new Date(today)
		day.setDate(day.getDate() - i)
		const key = isoDate(day)
		const expense = transactions
			.filter((t) => t.type === "expense" && t.date === key)
			.reduce((sum, t) => sum + Number(t.amount), 0)
		rows.push({
			day: day.toLocaleDateString("en-US", { weekday: "short" }),
			returnRate: expense,
		})
	}

	const total = rows.reduce((sum, row) => sum + row.returnRate, 0)
	return { rows, dailyAverage: total / 7 || 0 }
}

export function buildCategoryMix(
	transactions: TracklyTransaction[],
	days = 30
): CategoryMixDatum[] {
	const end = new Date()
	const start = new Date()
	start.setDate(start.getDate() - (days - 1))

	const expenses = transactions.filter(
		(t) => t.type === "expense" && inRange(t.date, start, end)
	)
	const total = expenses.reduce((sum, t) => sum + Number(t.amount), 0)
	if (!total) {
		return []
	}

	const byCategory = new Map<string, number>()
	for (const txn of expenses) {
		const name = txn.categories?.name ?? "Other"
		byCategory.set(name, (byCategory.get(name) ?? 0) + Number(txn.amount))
	}

	return [...byCategory.entries()]
		.map(([category, amount]) => ({
			category,
			share: Math.round((amount / total) * 100),
		}))
		.sort((a, b) => b.share - a.share)
}

export function formatCompactMoney(value: number, currency = "USD") {
	if (value >= 1000) {
		return formatFullCurrency(value).replace(/\.00$/, "")
	}
	return formatMoney(value, currency)
}
