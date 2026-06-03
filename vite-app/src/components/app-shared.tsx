import type { ReactNode } from "react";
import {
	BarChart3Icon,
	CalendarClockIcon,
	FolderKanbanIcon,
	LayoutGridIcon,
	LandmarkIcon,
	ReceiptIcon,
	SettingsIcon,
	SparklesIcon,
	DownloadIcon,
	ShieldIcon,
	WalletIcon,
} from "lucide-react";
import { appRouteHref, type AppRoute } from "@/hooks/use-app-route";

export type SidebarNavItem = {
	title: string;
	path?: string;
	icon?: ReactNode;
	isActive?: boolean;
	subItems?: SidebarNavItem[];
};

export type SidebarNavGroup = {
	label: string;
	items: SidebarNavItem[];
};

export function buildNavGroups(
	route: AppRoute,
	options?: { isAdmin?: boolean }
): SidebarNavGroup[] {
	const isAdmin = options?.isAdmin ?? false
	const toolsItems: SidebarNavItem[] = [
		{
			title: "AI Assistant",
			path: appRouteHref("ai"),
			icon: <SparklesIcon />,
			isActive: route === "ai",
		},
		{
			title: "Export",
			path: appRouteHref("export"),
			icon: <DownloadIcon />,
			isActive: route === "export",
		},
		{
			title: "Settings",
			path: appRouteHref("settings"),
			icon: <SettingsIcon />,
			isActive: route === "settings",
		},
	]
	if (isAdmin) {
		toolsItems.unshift({
			title: "Admin",
			path: appRouteHref("admin"),
			icon: <ShieldIcon />,
			isActive: route === "admin",
		})
	}

	return [
		{
			label: "Overview",
			items: [
				{
					title: "Dashboard",
					path: appRouteHref("dashboard"),
					icon: <LayoutGridIcon />,
					isActive: route === "dashboard",
				},
				{
					title: "Insights",
					path: appRouteHref("insights"),
					icon: <BarChart3Icon />,
					isActive: route === "insights",
				},
			],
		},
		{
			label: "Finance",
			items: [
				{
					title: "Transactions",
					path: appRouteHref("transactions"),
					icon: <ReceiptIcon />,
					isActive: route === "transactions",
				},
				{
					title: "Accounts",
					path: appRouteHref("accounts"),
					icon: <LandmarkIcon />,
					isActive: route === "accounts",
				},
				{
					title: "Budgets",
					path: appRouteHref("budgets"),
					icon: <WalletIcon />,
					isActive: route === "budgets",
				},
				{
					title: "Scheduled",
					path: appRouteHref("scheduled"),
					icon: <CalendarClockIcon />,
					isActive: route === "scheduled",
				},
				{
					title: "Receipts",
					path: appRouteHref("receipts"),
					icon: <ReceiptIcon />,
					isActive: route === "receipts",
				},
				{
					title: "Projects",
					path: appRouteHref("projects"),
					icon: <FolderKanbanIcon />,
					isActive: route === "projects",
				},
			],
		},
		{
			label: "Tools",
			items: toolsItems,
		},
	];
}

export function getActiveNavItem(
	route: AppRoute,
	options?: { isAdmin?: boolean }
): SidebarNavItem | undefined {
	const items = buildNavGroups(route, options).flatMap((group) =>
		group.items.flatMap((item) =>
			item.subItems?.length ? [item, ...item.subItems] : [item]
		)
	);
	return items.find((item) => item.isActive);
}

export const footerNavLinks: SidebarNavItem[] = [];

export function buildNavLinks(route: AppRoute): SidebarNavItem[] {
	return buildNavGroups(route).flatMap((group) =>
		group.items.flatMap((item) =>
			item.subItems?.length ? [item, ...item.subItems] : [item]
		)
	);
}