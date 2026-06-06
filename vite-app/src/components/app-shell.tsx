
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { useTrackly } from "@/contexts/trackly-provider";
import type { AppRoute } from "@/hooks/use-app-route";

function DataErrorBanner() {
	const { error, refresh } = useTrackly();
	if (!error) return null;

	return (
		<div className="trackly-glass mb-4 flex flex-col gap-2 rounded-xl border-destructive/40 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
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

function AppShellInner({
	children,
	route,
}: {
	children: React.ReactNode;
	route: AppRoute;
}) {
	const { setOpenMobile } = useSidebar();

	return (
		<>
			<AppSidebar route={route} />
			<SidebarInset className="relative min-h-dvh !bg-transparent px-3 pt-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-4 sm:pt-4 md:px-6 md:pt-6 min-[901px]:px-8 min-[901px]:py-6 min-[901px]:pb-6">
				<AppHeader route={route} />
				<DataErrorBanner />
				<div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-4">
					{children}
				</div>
			</SidebarInset>
			<MobileBottomNav
				onOpenMenu={() => setOpenMobile(true)}
				route={route}
			/>
		</>
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
			<AppShellInner route={route}>{children}</AppShellInner>
		</SidebarProvider>
	);
}