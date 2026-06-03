import { formatMoney } from "@/lib/trackly-metrics"
import type { TracklyTransaction } from "@/types/trackly"

export type CashflowPeriod = "today" | "month" | "6months"

export type CashflowSummary = {
	inflow: number
	outflow: number
	net: number
	inflowLabel: string
	outflowLabel: string
	netLabel: string
}

export type WeeklyCashflowRow = {
	week: string
	inflow: number
	outflow: number
}

function periodRange(period: CashflowPeriod): { start: Date; end: Date } {
	const end = new Date()
	end.setHours(23, 59, 59, 999)
	const start = new Date(end)

	if (period === "today") {
		start.setHours(0, 0, 0, 0)
		return { start, end }
	}

	if (period === "month") {
		start.setDate(1)
		start.setHours(0, 0, 0, 0)
		return { start, end }
	}

	start.setMonth(start.getMonth() - 5)
	start.setDate(1)
	start.setHours(0, 0, 0, 0)
	return { start, end }
}

function inPeriod(date: string, start: Date, end: Date) {
	const value = new Date(date)
	return value >= start && value <= end
}

export function buildCashflowSummary(
	transactions: TracklyTransaction[],
	period: CashflowPeriod,
	currency: string
): CashflowSummary {
	const { start, end } = periodRange(period)
	const rows = transactions.filter((t) => inPeriod(t.date, start, end))
	const inflow = rows
		.filter((t) => t.type === "income")
		.reduce((sum, t) => sum + Number(t.amount), 0)
	const outflow = rows
		.filter((t) => t.type === "expense")
		.reduce((sum, t) => sum + Number(t.amount), 0)
	const net = inflow - outflow

	return {
		inflow,
		outflow,
		net,
		inflowLabel: formatMoney(inflow, currency),
		outflowLabel: formatMoney(outflow, currency),
		netLabel: formatMoney(net, currency),
	}
}

export function buildWeeklyCashflowRows(
	transactions: TracklyTransaction[]
): WeeklyCashflowRow[] {
	const now = new Date()
	const month = now.getMonth()
	const year = now.getFullYear()
	const labels = ["Week 1", "Week 2", "Week 3", "Week 4"]
	const inflows = [0, 0, 0, 0]
	const outflows = [0, 0, 0, 0]

	for (const t of transactions) {
		const d = new Date(t.date)
		if (d.getMonth() !== month || d.getFullYear() !== year) continue
		const weekIndex = Math.min(3, Math.max(0, Math.ceil(d.getDate() / 7) - 1))
		if (t.type === "income") {
			inflows[weekIndex] += Number(t.amount)
		} else if (t.type === "expense") {
			outflows[weekIndex] += Number(t.amount)
		}
	}

	return labels.map((week, index) => ({
		week,
		inflow: inflows[index],
		outflow: outflows[index],
	}))
}