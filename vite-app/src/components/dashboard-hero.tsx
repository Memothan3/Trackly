import { useTrackly } from "@/contexts/trackly-provider"
import { formatMoney } from "@/lib/trackly-metrics"

function greeting() {
	const hour = new Date().getHours()
	if (hour < 12) return "Good morning"
	if (hour < 17) return "Good afternoon"
	return "Good evening"
}

export function DashboardHero() {
	const { profile, accounts, currency, stats } = useTrackly()
	const name = profile?.full_name?.split(" ")[0] ?? "there"
	const balance = stats[0]?.value ?? formatMoney(0, currency)

	return (
		<div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-6">
			<p className="text-muted-foreground text-sm">{greeting()}</p>
			<h1 className="mt-1 font-semibold text-2xl tracking-tight sm:text-3xl">
				{name}, your balance is {balance}
			</h1>
			<p className="mt-2 max-w-xl text-muted-foreground text-sm">
				{accounts.length} active account{accounts.length === 1 ? "" : "s"} synced
				from Supabase. Track spending, budgets, and receipts in one place.
			</p>
		</div>
	)
}