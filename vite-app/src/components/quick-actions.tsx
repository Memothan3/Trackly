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
import { appRouteHref } from "@/hooks/use-app-route";
import { useTrackly } from "@/contexts/trackly-provider";
import {
	ChevronRightIcon,
	DownloadIcon,
	LandmarkIcon,
	PlusIcon,
	ReceiptIcon,
	SparklesIcon,
	WalletIcon,
} from "lucide-react";

type QuickAction =
	| {
			title: string;
			description: string;
			icon: React.ReactNode;
			onClick: () => void;
	  }
	| {
			title: string;
			description: string;
			icon: React.ReactNode;
			href: string;
	  };

export function QuickActions() {
	const { openAddTransaction } = useTrackly();

	const actions: QuickAction[] = [
		{
			title: "Add transaction",
			description: "Log income, expense, or transfer.",
			icon: <PlusIcon aria-hidden="true" />,
			onClick: () => openAddTransaction(),
		},
		{
			title: "View transactions",
			description: "Full history from Supabase.",
			icon: <ReceiptIcon aria-hidden="true" />,
			href: appRouteHref("transactions"),
		},
		{
			title: "View accounts",
			description: "Balances and account types.",
			icon: <LandmarkIcon aria-hidden="true" />,
			href: appRouteHref("accounts"),
		},
		{
			title: "Manage budgets",
			description: "Track spending limits.",
			icon: <WalletIcon aria-hidden="true" />,
			href: appRouteHref("budgets"),
		},
		{
			title: "AI assistant",
			description: "Ask about spending with your live data.",
			icon: <SparklesIcon aria-hidden="true" />,
			href: appRouteHref("ai"),
		},
		{
			title: "Export data",
			description: "CSV and JSON backups.",
			icon: <DownloadIcon aria-hidden="true" />,
			href: appRouteHref("export"),
		},
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Quick actions</CardTitle>
				<CardDescription>Common tasks wired to your live data.</CardDescription>
			</CardHeader>
			<CardContent>
				<ItemGroup className="gap-0">
					{actions.map((a) =>
						"onClick" in a ? (
							<Item key={a.title} size="sm">
								<button
									className="flex w-full min-w-0 items-center gap-3 text-start"
									onClick={a.onClick}
									type="button"
								>
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
								</button>
							</Item>
						) : (
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
						)
					)}
				</ItemGroup>
			</CardContent>
		</Card>
	);
}