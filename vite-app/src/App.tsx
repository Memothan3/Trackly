import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth-gate";
import { DashboardBackground } from "@/components/dashboard-background";
import { Dashboard } from "@/components/dashboard";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { AccountsPage } from "@/components/accounts-page";
import { BudgetsPage } from "@/components/budgets-page";
import { InsightsPage } from "@/components/insights-page";
import { AiPage } from "@/components/ai-page";
import { ProjectsPage } from "@/components/projects-page";
import { ReceiptsPage } from "@/components/receipts-page";
import { ScheduledPage } from "@/components/scheduled-page";
import { ExportPage } from "@/components/export-page";
import { AdminPage } from "@/components/admin-page";
import { SettingsPage } from "@/components/settings-page";
import { TransactionsPage } from "@/components/transactions-page";
import { AddAccountSheet } from "@/components/add-account-sheet";
import { AddTransactionSheet } from "@/components/add-transaction-sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isAdminEmail } from "@/lib/auth-config";
import { useTrackly } from "@/contexts/trackly-provider";
import { useAppRoute, type AppRoute } from "@/hooks/use-app-route";

function TracklyPage({ route }: { route: AppRoute }) {
	switch (route) {
		case "transactions":
			return <TransactionsPage />;
		case "accounts":
			return <AccountsPage />;
		case "budgets":
			return <BudgetsPage />;
		case "insights":
			return <InsightsPage />;
		case "scheduled":
			return <ScheduledPage />;
		case "receipts":
			return <ReceiptsPage />;
		case "projects":
			return <ProjectsPage />;
		case "ai":
			return <AiPage />;
		case "export":
			return <ExportPage />;
		case "admin":
			return <AdminPage />;
		case "settings":
			return <SettingsPage />;
		default:
			return <Dashboard />;
	}
}

function AppChrome({ children }: { children: React.ReactNode }) {
	return (
		<>
			<DashboardBackground />
			<div className="relative min-h-dvh">{children}</div>
		</>
	);
}

function hasAppAccess(user: ReturnType<typeof useTrackly>["user"]) {
	if (!user) return false;
	return user.emailVerified || isAdminEmail(user.email);
}

function TracklyApp() {
	const { route } = useAppRoute();
	const { user, loading } = useTrackly();

	return (
		<AppChrome>
			{loading ? (
				<div className="p-6">
					<DashboardSkeleton />
				</div>
			) : !hasAppAccess(user) ? (
				<AuthGate />
			) : (
				<AppShell route={route}>
					<TracklyPage route={route} />
					<AddTransactionSheet />
					<AddAccountSheet />
				</AppShell>
			)}
		</AppChrome>
	);
}

export function App() {
	return (
		<TooltipProvider>
			<TracklyApp />
		</TooltipProvider>
	);
}

export default App;