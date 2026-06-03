import { Badge } from "@/components/ui/badge"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { formatDate } from "@/components/formater"
import { formatMoney } from "@/lib/trackly-metrics"
import { appRouteHref } from "@/hooks/use-app-route"
import type { TracklyScheduled } from "@/types/trackly"

export function ScheduledPreview({
	scheduled,
	currency,
	limit = 5,
}: {
	scheduled: TracklyScheduled[]
	currency: string
	limit?: number
}) {
	const rows = [...scheduled]
		.sort((a, b) => a.next_date.localeCompare(b.next_date))
		.slice(0, limit)

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between gap-2">
				<div>
					<CardTitle>Coming up</CardTitle>
					<CardDescription>Scheduled income and expenses</CardDescription>
				</div>
				<a
					className="text-primary text-sm underline-offset-4 hover:underline"
					href={appRouteHref("scheduled")}
				>
					View all
				</a>
			</CardHeader>
			<CardContent>
				{!rows.length ? (
					<p className="text-muted-foreground text-sm">
						No scheduled items yet. Add recurring transactions from the Scheduled
						page.
					</p>
				) : (
					<ul className="flex flex-col gap-3">
						{rows.map((row) => (
							<li
								className="flex items-start justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
								key={row.id}
							>
								<div className="min-w-0">
									<p className="truncate font-medium text-sm">
										{row.reason || "Scheduled"}
									</p>
									<p className="text-muted-foreground text-xs">
										{formatDate(row.next_date, "full")} · {row.frequency}
									</p>
								</div>
								<div className="flex shrink-0 flex-col items-end gap-1">
									<span className="font-medium text-sm tabular-nums">
										{formatMoney(Number(row.amount), currency)}
									</span>
									<Badge variant="outline">{row.type}</Badge>
								</div>
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	)
}