import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { appRouteHref } from "@/hooks/use-app-route"
import { buildBudgetProgress } from "@/lib/budget-metrics"
import type { TracklyBudget, TracklyTransaction } from "@/types/trackly"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type BudgetOverviewProps = {
	budgets: TracklyBudget[]
	transactions: TracklyTransaction[]
	currency: string
}

export function BudgetOverview({
	budgets,
	transactions,
	currency,
}: BudgetOverviewProps) {
	const progress = buildBudgetProgress(budgets, transactions, currency).slice(0, 4)

	return (
		<Card className="md:col-span-2">
			<CardHeader className="flex flex-row items-start justify-between gap-2">
				<div>
					<CardTitle>Budgets this month</CardTitle>
					<CardDescription>Spending vs limits by category</CardDescription>
				</div>
				<Button asChild size="sm" variant="ghost">
					<a href={appRouteHref("budgets")}>View all</a>
				</Button>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{!progress.length ? (
					<p className="text-muted-foreground text-sm">
						No active budgets yet. Add one from the Budgets page to track limits
						here.
					</p>
				) : (
					progress.map((row) => (
						<div className="flex flex-col gap-1.5" key={row.id}>
							<div className="flex items-center justify-between gap-2 text-sm">
								<span className="font-medium">{row.category}</span>
								<span className="text-muted-foreground tabular-nums">
									{row.spentLabel} / {row.limitLabel}
								</span>
							</div>
							<div className="h-1.5 overflow-hidden rounded-full bg-muted">
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
	)
}