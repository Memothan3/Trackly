import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@/components/ui/item"
import { appRouteHref } from "@/hooks/use-app-route"
import { formatMoney } from "@/lib/trackly-metrics"
import type { TracklyAccount } from "@/types/trackly"

type AccountsOverviewProps = {
	accounts: TracklyAccount[]
	currency: string
	onAddAccount: () => void
}

export function AccountsOverview({
	accounts,
	currency,
	onAddAccount,
}: AccountsOverviewProps) {
	const total = accounts.reduce((sum, a) => sum + Number(a.balance), 0)

	return (
		<Card className="md:col-span-2">
			<CardHeader className="flex flex-row items-start justify-between gap-2">
				<div>
					<CardTitle>Accounts</CardTitle>
					<CardDescription>
						Total capital {formatMoney(total, currency)} across {accounts.length}{" "}
						account{accounts.length === 1 ? "" : "s"}
					</CardDescription>
				</div>
				<div className="flex shrink-0 gap-2">
					<Button onClick={onAddAccount} size="sm" variant="outline">
						Add
					</Button>
					<Button asChild size="sm" variant="ghost">
						<a href={appRouteHref("accounts")}>View all</a>
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{!accounts.length ? (
					<p className="text-muted-foreground text-sm">
						Create an account to track balances.
					</p>
				) : (
					<ItemGroup className="gap-0">
						{accounts.slice(0, 5).map((account) => (
							<Item key={account.id} size="sm">
								<ItemContent>
									<ItemTitle>{account.name}</ItemTitle>
									<ItemDescription>
										{account.type} · {account.currency}
									</ItemDescription>
								</ItemContent>
								<span className="font-medium text-sm tabular-nums">
									{formatMoney(Number(account.balance), account.currency)}
								</span>
							</Item>
						))}
					</ItemGroup>
				)}
			</CardContent>
		</Card>
	)
}