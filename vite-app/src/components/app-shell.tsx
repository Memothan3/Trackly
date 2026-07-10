import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { Outlet } from "react-router-dom";

export function AppShell({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="p-4 md:p-6">
				<AppHeader />
				<div className="flex flex-1 flex-col gap-4">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
