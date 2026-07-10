import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth-gate";
import { Dashboard } from "@/components/dashboard";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTrackly } from "@/contexts/trackly-provider";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TransactionsPage } from "@/pages/TransactionsPage";

function TracklyApp() {
	const { user, loading } = useTrackly();

	if (loading) {
		return (
			<div className="p-6">
				<DashboardSkeleton />
			</div>
		);
	}

	if (!user) {
		return <AuthGate />;
	}

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={
					<AppShell>
						<Dashboard />
					</AppShell>
				} />
				<Route path="/transactions" element={
					<AppShell>
						<TransactionsPage />
					</AppShell>
				} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
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
