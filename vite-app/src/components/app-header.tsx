"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { CustomSidebarTrigger } from "@/components/custom-sidebar-trigger";
import { getActiveNavItem } from "@/components/app-shared";
import { NavUser } from "@/components/nav-user";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTrackly } from "@/contexts/trackly-provider";
import type { AppRoute } from "@/hooks/use-app-route";


export function AppHeader({ route }: { route: AppRoute }) {
	const { openAddTransaction, isAdmin } = useTrackly();
	const activeItem = getActiveNavItem(route, { isAdmin });

	return (
		<header
			className={cn(
				"trackly-glass sticky top-0 z-20 mb-3 flex items-center justify-between gap-2 rounded-2xl px-3 py-2 sm:mb-5 sm:px-4 min-[901px]:mb-6"
			)}
		>
			<div className="flex min-w-0 items-center gap-2 sm:gap-3">
				<CustomSidebarTrigger />
				<Separator
					className="hidden h-4 sm:block data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				<div className="flex min-w-0 items-center gap-2">
					<AppBreadcrumbs page={activeItem} />
					{isAdmin ? (
						<span className="hidden rounded-full bg-destructive/15 px-2 py-0.5 font-medium text-destructive text-xs sm:inline">
							Admin
						</span>
					) : null}
				</div>
			</div>
			<div className="flex shrink-0 items-center gap-1 sm:gap-2">
				<Button
					className="hidden min-[901px]:inline-flex"
					onClick={() => openAddTransaction()}
					size="sm"
				>
					Add transaction
				</Button>
				<ThemeToggle />
				<Separator
					className="hidden h-4 sm:block data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				<NavUser />
			</div>
		</header>
	);
}