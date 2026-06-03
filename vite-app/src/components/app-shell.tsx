import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { useTrackly } from "@/contexts/trackly-provider";
import type { AppRoute } from "@/hooks/use-app-route";

function DataErrorBanner() {
	const { error, refresh } = useTrackly();
	if (!error) return null;

	return (
		<div className="mb-4 flex flex-col gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
			<div>
				<p className="font-medium text-destructive">Could not sync data</p>
				<p className="text-destructive/90">{error}</p>
			</div>
			<Button
				onClick={() => {
					void refresh();
				}}
				size="sm"
				variant="outline"
			>
				Retry
			</Button>
		</div>
	);
}

export function AppShell({
	children,
	route,
}: {
	children: React.ReactNode;
	route: AppRoute;
}) {
	return (
		<SidebarProvider className="trackly-app-shell relative min-h-dvh !bg-transparent">
			<AppSidebar route={route} />
			<SidebarInset className="relative min-h-dvh !bg-transparent p-3 sm:p-4 md:p-6 min-[901px]:px-8 min-[901px]:py-6">
				<AppHeader route={route} />
				<DataErrorBanner />
				<div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-4">
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}