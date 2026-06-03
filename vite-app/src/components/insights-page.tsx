import { CategoryRankChart } from "@/components/category-rank-chart"
import { FinancialPosition } from "@/components/financial-position"
import { RefundReturnRateChart } from "@/components/refund-return-rate-chart"
import { RevenueChart } from "@/components/revenue-chart"
import { DashboardStats } from "@/components/stats"
import { useTrackly } from "@/contexts/trackly-provider"

export function InsightsPage() {
	const { stats, incomeChartData, expenseTrend, categoryMix, currency } =
		useTrackly()

	return (
		<div className="flex flex-col gap-4">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">Insights</h1>
				<p className="text-muted-foreground text-sm">
					Financial position, charts, and KPIs from your transaction history.
				</p>
			</div>

			<FinancialPosition />

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<DashboardStats stats={stats} />
				<RevenueChart data={incomeChartData} />
				<RefundReturnRateChart
					currency={currency}
					dailyAverage={expenseTrend.dailyAverage}
					rows={expenseTrend.rows}
				/>
				<CategoryRankChart data={categoryMix} />
			</div>
		</div>
	)
}