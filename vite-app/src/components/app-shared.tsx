import type { ReactNode } from "react";
import {
	BarChart3Icon,
	CalendarClockIcon,
	LayoutGridIcon,
	LandmarkIcon,
	ReceiptIcon,
	SettingsIcon,
	SparklesIcon,
	WalletIcon,
} from "lucide-react";
import { tracklyDashboardUrl } from "@/lib/legacy-links";

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

export function buildNavGroups(): SidebarNavGroup[] {
	return [
		{
			label: "Overview",
			items: [
				{
					title: "Dashboard",
					path: "/",
					icon: <LayoutGridIcon />,
					isActive: true,
				},
				{
					title: "Insights",
					path: "/insights", // TODO: Implement insights page
					icon: <BarChart3Icon />,
				},
			],
		},
		{
			label: "Finance",
			items: [
				{
					title: "Transactions",
					path: "/transactions",
					icon: <ReceiptIcon />,
				},
				{
					title: "Accounts",
					path: "/accounts", // TODO: Implement accounts page
					icon: <LandmarkIcon />,
				},
				{
					title: "Budgets",
					path: "/budgets", // TODO: Implement budgets page
					icon: <WalletIcon />,
				},
				{
					title: "Scheduled",
					path: "/scheduled", // TODO: Implement scheduled page
					icon: <CalendarClockIcon />,
				},
			],
		},
		{
			label: "Tools",
			items: [
				{
					title: "AI Assistant",
					path: "/ai", // TODO: Implement AI page
					icon: <SparklesIcon />,
				},
				{
					title: "Settings",
					path: "/settings", // TODO: Implement settings page
					icon: <SettingsIcon />,
				},
			],
		},
	];
}

export const footerNavLinks: SidebarNavItem[] = [
	{
		title: "Classic dashboard",
		path: "/", // Redirect to home which will show dashboard
		icon: <LayoutGridIcon />,
	},
];

export const navLinks: SidebarNavItem[] = [
	...buildNavGroups().flatMap((group) =>
		group.items.flatMap((item) =>
			item.subItems?.length ? [item, ...item.subItems] : [item]
		)
	),
	...footerNavLinks,
];
