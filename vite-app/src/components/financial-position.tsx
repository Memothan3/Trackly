"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { CashflowChart } from "@/components/cashflow-chart"
import {
	buildCashflowSummary,
	buildWeeklyCashflowRows,
	type CashflowPeriod,
} from "@/lib/cashflow-metrics"
import { appRouteHref } from "@/hooks/use-app-route"
import { useTrackly } from "@/contexts/trackly-provider"
import { cn } from "@/lib/utils"

const PERIODS: { id: CashflowPeriod; label: string }[] = [
	{ id: "today", label: "Today" },
	{ id: "month", label: "This month" },
	{ id: "6months", label: "Last 6 months" },
]

export function FinancialPosition() {
	const { transactions, currency } = useTrackly()
	const [period, setPeriod] = useState<CashflowPeriod>("month")

	const summary = useMemo(
		() => buildCashflowSummary(transactions, period, currency),
		[transactions, period, currency]
	)

	const weeklyRows = useMemo(
		() => buildWeeklyCashflowRows(transactions),
		[transactions]
	)

	return (
		<div className="flex flex-col gap-4">
			<Card>
				<CardHeader className="gap-3">
					<div className="flex flex-wrap items-start justify-between gap-3">
						<div>
							<CardTitle>Financial position</CardTitle>
							<CardDescription>
								All accounts in {currency} — cashflow from live transactions
							</CardDescription>
						</div>
						<div className="flex flex-wrap gap-1 rounded-xl border border-border/60 bg-muted/40 p-1">
							{PERIODS.map((p) => (
								<Button
									className={cn(
										"h-8 rounded-lg px-3 text-xs",
										period === p.id && "bg-background shadow-sm"
									)}
									key={p.id}
									onClick={() => setPeriod(p.id)}
									size="sm"
									type="button"
									variant={period === p.id ? "secondary" : "ghost"}
								>
									{p.label}
								</Button>
							))}
						</div>
					</div>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-3">
					<div className="rounded-xl border border-border/60 bg-card/80 p-4">
						<p className="text-muted-foreground text-xs uppercase tracking-wide">
							Net cashflow
						</p>
						<p
							className={cn(
								"mt-1 font-semibold text-2xl tabular-nums tracking-tight",
								summary.net >= 0 ? "text-primary" : "text-destructive"
							)}
						>
							{summary.netLabel}
						</p>
					</div>
					<div className="rounded-xl border border-border/60 bg-card/80 p-4">
						<p className="text-muted-foreground text-xs uppercase tracking-wide">
							Inflow
						</p>
						<p className="mt-1 font-semibold text-2xl text-primary tabular-nums tracking-tight">
							{summary.inflowLabel}
						</p>
					</div>
					<div className="rounded-xl border border-border/60 bg-card/80 p-4">
						<p className="text-muted-foreground text-xs uppercase tracking-wide">
							Outflow
						</p>
						<p className="mt-1 font-semibold text-2xl text-destructive tabular-nums tracking-tight">
							{summary.outflowLabel}
						</p>
					</div>
				</CardContent>
			</Card>

			{period === "month" ? <CashflowChart data={weeklyRows} /> : null}

			<div className="flex justify-end">
				<Button asChild size="sm" variant="outline">
					<a href={appRouteHref("transactions")}>View all transactions</a>
				</Button>
			</div>
		</div>
	)
}