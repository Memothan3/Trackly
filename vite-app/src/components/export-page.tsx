import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { useTrackly } from "@/contexts/trackly-provider"
import {
	exportAccountsCsv,
	exportSnapshotJson,
	exportTransactionsCsv,
} from "@/lib/export-utils"

export function ExportPage() {
	const {
		user,
		accounts,
		transactions,
		receipts,
		scheduled,
		budgets,
		projects,
	} = useTrackly()
	const [message, setMessage] = useState<string | null>(null)

	function notify(text: string) {
		setMessage(text)
		window.setTimeout(() => setMessage(null), 4000)
	}

	return (
		<div className="flex max-w-2xl flex-col gap-4">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">Export</h1>
				<p className="text-muted-foreground text-sm">
					Download your live Supabase data as CSV or a full JSON snapshot.
				</p>
			</div>

			{message ? (
				<p className="text-muted-foreground text-sm" role="status">
					{message}
				</p>
			) : null}

			<Card>
				<CardHeader>
					<CardTitle>Spreadsheets</CardTitle>
					<CardDescription>Comma-separated files for Excel or Sheets</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
					<Button
						onClick={() => {
							if (!exportTransactionsCsv(transactions)) {
								notify("No transactions to export.")
								return
							}
							notify("Transactions CSV downloaded.")
						}}
						type="button"
					>
						Export transactions CSV
					</Button>
					<Button
						onClick={() => {
							if (!exportAccountsCsv(accounts)) {
								notify("No accounts to export.")
								return
							}
							notify("Accounts CSV downloaded.")
						}}
						type="button"
						variant="outline"
					>
						Export accounts CSV
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Full snapshot</CardTitle>
					<CardDescription>
						JSON backup of accounts, transactions, receipts, scheduled items, and
						budgets
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						onClick={() => {
							exportSnapshotJson({
								exported_at: new Date().toISOString(),
								user_id: user?.uid ?? null,
								totals: {
									accounts: accounts.length,
									transactions: transactions.length,
									receipts: receipts.length,
									scheduled: scheduled.length,
									budgets: budgets.length,
									projects: projects.length,
								},
								accounts,
								transactions,
								receipts,
								scheduled,
								budgets,
								projects,
							})
							notify("Snapshot JSON downloaded.")
						}}
						type="button"
						variant="secondary"
					>
						Download snapshot JSON
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}