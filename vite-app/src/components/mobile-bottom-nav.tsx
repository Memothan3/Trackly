"use client"

import { cn } from "@/lib/utils"
import { appRouteHref, type AppRoute } from "@/hooks/use-app-route"
import { useTrackly } from "@/contexts/trackly-provider"
import {
	LayoutGridIcon,
	MoreHorizontalIcon,
	PlusIcon,
	ReceiptIcon,
	WalletIcon,
} from "lucide-react"

const MOBILE_TABS: {
	route: AppRoute
	label: string
	icon: typeof LayoutGridIcon
}[] = [
	{ route: "dashboard", label: "Home", icon: LayoutGridIcon },
	{ route: "transactions", label: "Txns", icon: ReceiptIcon },
	{ route: "budgets", label: "Budgets", icon: WalletIcon },
]

type MobileBottomNavProps = {
	route: AppRoute
	onOpenMenu: () => void
}

export function MobileBottomNav({ route, onOpenMenu }: MobileBottomNavProps) {
	const { openAddTransaction } = useTrackly()

	return (
		<nav
			aria-label="Main navigation"
			className="trackly-glass fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 grid grid-cols-5 items-center gap-0.5 rounded-2xl px-1.5 py-1.5 min-[901px]:hidden"
		>
			{MOBILE_TABS.slice(0, 2).map((tab) => {
				const Icon = tab.icon
				const active = route === tab.route
				return (
					<a
						className={cn(
							"flex min-w-0 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] transition-colors",
							active
								? "bg-primary/15 text-primary"
								: "text-muted-foreground hover:bg-white/5 hover:text-foreground"
						)}
						href={appRouteHref(tab.route)}
						key={tab.route}
					>
						<Icon className="size-4 shrink-0" />
						<span className="truncate">{tab.label}</span>
					</a>
				)
			})}
			<button
				aria-label="Add transaction"
				className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
				onClick={() => openAddTransaction()}
				type="button"
			>
				<PlusIcon className="size-5" />
			</button>
			{MOBILE_TABS.slice(2).map((tab) => {
				const Icon = tab.icon
				const active = route === tab.route
				return (
					<a
						className={cn(
							"flex min-w-0 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] transition-colors",
							active
								? "bg-primary/15 text-primary"
								: "text-muted-foreground hover:bg-white/5 hover:text-foreground"
						)}
						href={appRouteHref(tab.route)}
						key={tab.route}
					>
						<Icon className="size-4 shrink-0" />
						<span className="truncate">{tab.label}</span>
					</a>
				)
			})}
			<button
				aria-label="More menu"
				className="flex min-w-0 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
				onClick={onOpenMenu}
				type="button"
			>
				<MoreHorizontalIcon className="size-4 shrink-0" />
				<span>More</span>
			</button>
		</nav>
	)
}