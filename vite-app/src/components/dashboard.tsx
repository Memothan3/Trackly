import { CategoryRankChart } from "@/components/category-rank-chart";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { QuickActions } from "@/components/quick-actions";
import { RefundReturnRateChart } from "@/components/refund-return-rate-chart";
import { RevenueChart } from "@/components/revenue-chart";
import { DashboardStats } from "@/components/stats";
import { useTrackly } from "@/contexts/trackly-provider";

export function Dashboard() {
	const {
		stats,
		incomeChartData,
		expenseTrend,
		categoryMix,
		currency,
		loading,
		error,
	} = useTrackly();

	if (loading) {
		return <DashboardSkeleton />;
	}

	return (
		<div className="flex flex-col gap-4">
			{error ? (
				<div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive text-sm">
					<p className="font-medium">Could not load data</p>
					<p>{error}</p>
				</div>
			) : null}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<DashboardStats stats={stats} />
				<RevenueChart data={incomeChartData} />
				<RefundReturnRateChart
					currency={currency}
					dailyAverage={expenseTrend.dailyAverage}
					rows={expenseTrend.rows}
				/>
				<CategoryRankChart data={categoryMix} />
				<QuickActions />
			</div>
		</div>
	);
}
