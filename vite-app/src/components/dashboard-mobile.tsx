import { CategoryRankChart } from "@/components/category-rank-chart";
import { DashboardHero } from "@/components/dashboard-hero";
import { QuickActions } from "@/components/quick-actions";
import { RefundReturnRateChart } from "@/components/refund-return-rate-chart";
import { RevenueChart } from "@/components/revenue-chart";
import { DashboardStats } from "@/components/stats";
import { AccountsOverview } from "@/components/accounts-overview";
import { BudgetOverview } from "@/components/budget-overview";
import { ScheduledPreview } from "@/components/scheduled-preview";
import { TransactionList } from "@/components/transaction-list";
import type {
	CategoryMixDatum,
	DashboardStat,
	ExpenseTrendRow,
	IncomeChartRow,
	TracklyAccount,
	TracklyBudget,
	TracklyScheduled,
	TracklyTransaction,
} from "@/types/trackly";

type DashboardMobileProps = {
	displayName?: string | null;
	error: string | null;
	stats: DashboardStat[];
	incomeChartData: IncomeChartRow[];
	expenseTrend: {
		dailyAverage: number;
		rows: ExpenseTrendRow[];
	};
	categoryMix: CategoryMixDatum[];
	currency: string;
	accounts: TracklyAccount[];
	transactions: TracklyTransaction[];
	budgets: TracklyBudget[];
	scheduled: TracklyScheduled[];
	onAddAccount: () => void;
	onAddTransaction: () => void;
};

/** Mobile / tablet dashboard — unchanged layout below 901px. */
export function DashboardMobile({
	error,
	stats,
	incomeChartData,
	expenseTrend,
	categoryMix,
	currency,
	accounts,
	transactions,
	budgets,
	scheduled,
	onAddAccount,
	onAddTransaction,
}: DashboardMobileProps) {
	return (
		<div className="flex flex-col gap-4">
			<DashboardHero />
			{error ? (
				<div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive text-sm">
					<p className="font-medium">Could not load data</p>
					<p>{error}</p>
				</div>
			) : null}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<DashboardStats stats={stats} />
				<RevenueChart data={incomeChartData} />
				<RefundReturnRateChart
					currency={currency}
					dailyAverage={expenseTrend.dailyAverage}
					rows={expenseTrend.rows}
				/>
				<CategoryRankChart data={categoryMix} />
			</div>
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<ScheduledPreview currency={currency} scheduled={scheduled} />
				</div>
				<QuickActions />
			</div>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<AccountsOverview
					accounts={accounts}
					currency={currency}
					onAddAccount={onAddAccount}
				/>
				<BudgetOverview
					budgets={budgets}
					currency={currency}
					transactions={transactions}
				/>
			</div>
			<TransactionList
				currency={currency}
				limit={8}
				transactions={transactions}
			/>
			<div className="flex justify-end">
				<button
					className="text-primary text-sm underline-offset-4 hover:underline"
					onClick={onAddTransaction}
					type="button"
				>
					Add transaction
				</button>
			</div>
		</div>
	);
}