import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { tracklyDashboardUrl } from "@/lib/legacy-links";
import {
	ChevronRightIcon,
	DownloadIcon,
	LandmarkIcon,
	PlusIcon,
	WalletIcon,
} from "lucide-react";

export function QuickActions() {
	const actions = [
		{
			title: "Add transaction",
			description: "Log income or expense.",
			href: tracklyDashboardUrl(),
			icon: <PlusIcon aria-hidden="true" />,
		},
		{
			title: "View accounts",
			description: "Balances and account types.",
			href: tracklyDashboardUrl("accounts"),
			icon: <LandmarkIcon aria-hidden="true" />,
		},
		{
			title: "Manage budgets",
			description: "Track spending limits.",
			href: tracklyDashboardUrl("budgets"),
			icon: <WalletIcon aria-hidden="true" />,
		},
		{
			title: "Classic dashboard",
			description: "Open full Trackly UI.",
			href: tracklyDashboardUrl(),
			icon: <DownloadIcon aria-hidden="true" />,
		},
	] as const;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Quick actions</CardTitle>
				<CardDescription>Jump to common Trackly tasks.</CardDescription>
			</CardHeader>
			<CardContent>
				<ItemGroup className="gap-0">
					{actions.map((a) => (
						<Item asChild key={a.title} size="sm">
							<a href={a.href}>
								<ItemMedia variant="icon">{a.icon}</ItemMedia>
								<ItemContent>
									<ItemTitle>{a.title}</ItemTitle>
									<ItemDescription className="line-clamp-1">
										{a.description}
									</ItemDescription>
								</ItemContent>
								<ItemActions>
									<ChevronRightIcon
										aria-hidden="true"
										className="size-4 shrink-0 text-muted-foreground"
									/>
								</ItemActions>
							</a>
						</Item>
					))}
				</ItemGroup>
			</CardContent>
		</Card>
	);
}
