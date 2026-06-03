import { CategoryRankChart } from "@/components/category-rank-chart";
import { QuickActions } from "@/components/quick-actions";
import { RefundReturnRateChart } from "@/components/refund-return-rate-chart";
import { RevenueChart } from "@/components/revenue-chart";
import { DashboardStats } from "@/components/stats";
import { AccountsOverview } from "@/components/accounts-overview";
import { BudgetOverview } from "@/components/budget-overview";
import { ScheduledPreview } from "@/components/scheduled-preview";
import { TransactionList } from "@/components/transaction-list";
import { appRouteHref } from "@/hooks/use-app-route";
import { formatMoney } from "@/lib/trackly-metrics";
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

function greeting() {
	const hour = new Date().getHours();
	if (hour < 12) return "morning";
	if (hour < 17) return "afternoon";
	return "evening";
}

type DashboardDesktopProps = {
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
};

/** Desktop dashboard — semantic HTML bento (901px+). Mobile layout is separate. */
export function DashboardDesktop({
	displayName,
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
}: DashboardDesktopProps) {
	const name = displayName?.split(" ")[0] ?? "there";
	const totalBalance = stats[0]?.value ?? formatMoney(0, currency);
	const dateLabel = new Intl.DateTimeFormat("en", {
		weekday: "long",
		month: "long",
		day: "numeric",
	}).format(new Date());

	return (
		<div className="trackly-dash-desktop">
			{error ? (
				<div
					className="trackly-dash-alert"
					role="alert"
				>
					<p className="font-medium">Could not load data</p>
					<p>{error}</p>
				</div>
			) : null}

			<header className="trackly-dash-intro">
				<div className="trackly-dash-greeting">
					<h1 className="trackly-dash-greeting-title">
						Good <em>{greeting()}</em>, {name}.
					</h1>
					<p className="trackly-dash-greeting-sub">
						<time dateTime={new Date().toISOString().slice(0, 10)}>
							{dateLabel}
						</time>
					</p>
				</div>
				<aside className="trackly-dash-capital" aria-label="Total capital">
					<p className="trackly-dash-capital-label">Total capital</p>
					<p className="trackly-dash-capital-amount">{totalBalance}</p>
					<p className="trackly-dash-capital-meta">
						{accounts.length} active account
						{accounts.length === 1 ? "" : "s"}
					</p>
					<a
						className="trackly-dash-capital-link"
						href={appRouteHref("insights")}
					>
						Financial position →
					</a>
				</aside>
			</header>

			<section
				aria-labelledby="dash-overview-heading"
				className="trackly-dash-section"
			>
				<h2 id="dash-overview-heading" className="sr-only">
					Overview
				</h2>
				<div className="trackly-dash-bento">
					<div className="trackly-dash-bento-stats">
						<DashboardStats stats={stats} />
					</div>
					<article className="trackly-dash-slot trackly-dash-slot--wide">
						<RevenueChart data={incomeChartData} />
					</article>
					<article className="trackly-dash-slot trackly-dash-slot--half">
						<RefundReturnRateChart
							currency={currency}
							dailyAverage={expenseTrend.dailyAverage}
							rows={expenseTrend.rows}
						/>
					</article>
					<article className="trackly-dash-slot">
						<CategoryRankChart data={categoryMix} />
					</article>
					<article className="trackly-dash-slot">
						<QuickActions />
					</article>
				</div>
			</section>

			<section
				aria-labelledby="dash-activity-heading"
				className="trackly-dash-section"
			>
				<h2 id="dash-activity-heading" className="sr-only">
					Recent activity
				</h2>
				<div className="trackly-dash-split">
					<article className="trackly-dash-panel">
						<TransactionList
							currency={currency}
							limit={8}
							transactions={transactions}
						/>
					</article>
					<article className="trackly-dash-panel">
						<ScheduledPreview currency={currency} scheduled={scheduled} />
					</article>
				</div>
			</section>

			<section
				aria-labelledby="dash-accounts-heading"
				className="trackly-dash-section"
			>
				<h2 id="dash-accounts-heading" className="sr-only">
					Accounts and budgets
				</h2>
				<div className="trackly-dash-split trackly-dash-split--balanced">
					<article className="trackly-dash-panel">
						<AccountsOverview
							accounts={accounts}
							currency={currency}
							onAddAccount={onAddAccount}
						/>
					</article>
					<article className="trackly-dash-panel">
						<BudgetOverview
							budgets={budgets}
							currency={currency}
							transactions={transactions}
						/>
					</article>
				</div>
			</section>
		</div>
	);
}