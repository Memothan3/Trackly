import { PageHeader } from "@/components/page-header"
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
import { useTrackly } from "@/contexts/trackly-provider"
import { formatMoney } from "@/lib/trackly-metrics"

export function AccountsPage() {
	const { accounts, currency, setAddAccountOpen, deactivateAccount } = useTrackly()
	const total = accounts.reduce((sum, a) => sum + Number(a.balance), 0)

	return (
		<div className="flex flex-col gap-4">
			<PageHeader
				action={<Button onClick={() => setAddAccountOpen(true)}>Add account</Button>}
				description={`Total capital ${formatMoney(total, currency)}`}
				title="Accounts"
			/>
			<Card>
				<CardHeader>
					<CardTitle>Active accounts</CardTitle>
					<CardDescription>
						Balances update when you add transactions in Trackly.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{!accounts.length ? (
						<p className="text-muted-foreground text-sm">
							No accounts yet. Create one to start tracking balances.
						</p>
					) : (
						<ItemGroup className="gap-0">
							{accounts.map((account) => (
								<Item key={account.id} size="sm">
									<ItemContent>
										<ItemTitle>{account.name}</ItemTitle>
										<ItemDescription>
											{account.type} · {account.currency}
										</ItemDescription>
									</ItemContent>
									<div className="flex shrink-0 items-center gap-2">
										<span className="font-semibold text-sm tabular-nums">
											{formatMoney(Number(account.balance), account.currency)}
										</span>
										<Button
											onClick={() => {
												if (
													confirm(
														`Archive "${account.name}"? It will be hidden from the app.`
													)
												) {
													void deactivateAccount(account.id)
												}
											}}
											size="sm"
											type="button"
											variant="ghost"
										>
											Archive
										</Button>
									</div>
								</Item>
							))}
						</ItemGroup>
					)}
				</CardContent>
			</Card>
		</div>
	)
}