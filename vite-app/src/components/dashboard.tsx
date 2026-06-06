import { DashboardDesktop } from "@/components/dashboard-desktop";
import { DashboardMobile } from "@/components/dashboard-mobile";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { useTrackly } from "@/contexts/trackly-provider";

export function Dashboard() {
	const {
		profile,
		stats,
		incomeChartData,
		expenseTrend,
		categoryMix,
		currency,
		accounts,
		transactions,
		budgets,
		scheduled,
		loading,
		error,
		openAddTransaction,
		setAddAccountOpen,
	} = useTrackly();

	if (loading && !profile) {
		return <DashboardSkeleton />;
	}

	const shared = {
		displayName: profile?.full_name,
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
		onAddAccount: () => setAddAccountOpen(true),
		onAddTransaction: () => openAddTransaction(),
	};

	return (
		<>
			<div className="max-[900px]:block min-[901px]:hidden">
				<DashboardMobile {...shared} />
			</div>
			<div className="max-[900px]:hidden min-[901px]:block">
				<DashboardDesktop {...shared} />
			</div>
		</>
	);
}