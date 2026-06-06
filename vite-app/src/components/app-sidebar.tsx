"use client";

import { Logo, LogoIcon } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavGroup } from "@/components/nav-group";
import { buildNavGroups, footerNavLinks } from "@/components/app-shared";
import { appRouteHref } from "@/hooks/use-app-route";
import { useTrackly } from "@/contexts/trackly-provider";
import type { AppRoute } from "@/hooks/use-app-route";
import { PlusIcon } from "lucide-react";

export function AppSidebar({ route }: { route: AppRoute }) {
	const { openAddTransaction, refresh, isAdmin } = useTrackly();
	const navGroups = buildNavGroups(route, { isAdmin });

	return (
		<Sidebar collapsible="icon" variant="floating">
			<SidebarHeader className="h-14 justify-center">
				<SidebarMenuButton asChild>
					<a className="gap-2" href={appRouteHref("dashboard")}>
						<Logo className="h-7 w-auto max-w-[132px] group-data-[collapsible=icon]:hidden" />
						<LogoIcon className="hidden size-7 group-data-[collapsible=icon]:block" />
					</a>
				</SidebarMenuButton>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarMenuItem className="flex items-center gap-2">
						<SidebarMenuButton
							className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
							onClick={() => openAddTransaction()}
							tooltip="Add transaction"
						>
							<PlusIcon />
							<span>Add transaction</span>
						</SidebarMenuButton>
						<Button
							aria-label="Refresh data"
							className="size-8 group-data-[collapsible=icon]:opacity-0"
							onClick={() => {
								void refresh();
							}}
							size="icon"
							variant="outline"
						>
							↻
						</Button>
					</SidebarMenuItem>
				</SidebarGroup>
				{navGroups.map((group, index) => (
					<NavGroup key={`sidebar-group-${index}`} {...group} />
				))}
			</SidebarContent>
			{footerNavLinks.length ? (
				<SidebarFooter>
					<SidebarMenu className="mt-2">
						{footerNavLinks.map((item) => (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									asChild
									className="text-muted-foreground"
									size="sm"
								>
									<a href={item.path}>
										{item.icon}
										<span>{item.title}</span>
									</a>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarFooter>
			) : null}
		</Sidebar>
	);
}