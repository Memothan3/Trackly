import { SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-screen">
			<SidebarProvider>
				<AppSidebar />
			</SidebarProvider>
			<main className="flex-1 p-4 md:p-6 bg-background">
				<AppHeader />
				<div className="flex flex-1 flex-col gap-4">
					{children}
				</div>
			</main>
		</div>
	);
}
