import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/components/formater"
import { formatMoney } from "@/lib/trackly-metrics"
import {
	canCreateExpenseFromReceipt,
	parseReceiptExtraction,
} from "@/lib/receipt-helpers"
import { getGeminiApiKey } from "@/lib/gemini"
import { appRouteHref } from "@/hooks/use-app-route"
import { useTrackly } from "@/contexts/trackly-provider"

export function ReceiptsPage() {
	const {
		receipts,
		currency,
		accounts,
		uploadReceipt,
		createExpenseFromReceipt,
		rescanReceipt,
		removeReceipt,
	} = useTrackly()
	const inputRef = useRef<HTMLInputElement>(null)
	const [uploading, setUploading] = useState(false)
	const [busyId, setBusyId] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	async function handleUpload(file: File) {
		setUploading(true)
		setError(null)
		try {
			await uploadReceipt(file, "expense", Boolean(getGeminiApiKey()))
		} catch (err) {
			setError(err instanceof Error ? err.message : "Upload failed")
		} finally {
			setUploading(false)
		}
	}

	async function runReceiptAction(
		receiptId: string,
		action: () => Promise<void>
	) {
		setBusyId(receiptId)
		setError(null)
		try {
			await action()
		} catch (err) {
			setError(err instanceof Error ? err.message : "Action failed")
		} finally {
			setBusyId(null)
		}
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h1 className="font-semibold text-2xl tracking-tight">Receipts</h1>
					<p className="text-muted-foreground text-sm">
						Upload, scan with Gemini, and create expenses linked to your ledger.
					</p>
				</div>
				<div className="flex gap-2">
					<input
						accept="image/*,application/pdf"
						className="hidden"
						onChange={(e) => {
							const file = e.target.files?.[0]
							if (file) void handleUpload(file)
							e.target.value = ""
						}}
						ref={inputRef}
						type="file"
					/>
					<Button
						disabled={uploading}
						onClick={() => inputRef.current?.click()}
					>
						{uploading ? "Uploading…" : "Upload receipt"}
					</Button>
				</div>
			</div>

			{!getGeminiApiKey() ? (
				<p className="text-muted-foreground text-sm">
					Add a Gemini API key in{" "}
					<a className="text-primary underline" href={appRouteHref("settings")}>
						Settings
					</a>{" "}
					to enable AI extraction.
				</p>
			) : null}

			{!accounts.length ? (
				<p className="text-destructive text-sm">
					Create an account before turning receipts into transactions.
				</p>
			) : null}

			{error ? <p className="text-destructive text-sm">{error}</p> : null}

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{!receipts.length ? (
					<Card className="sm:col-span-2 lg:col-span-3">
						<CardContent className="pt-6">
							<p className="text-muted-foreground text-sm">No receipts yet.</p>
						</CardContent>
					</Card>
				) : (
					receipts.map((r) => {
						const extracted = parseReceiptExtraction(r)
						const src =
							r.image_url?.startsWith("data:") || r.image_url?.startsWith("http")
								? r.image_url
								: undefined
						const linked = Boolean(r.transaction_id)
						const canExpense = canCreateExpenseFromReceipt(r)
						const busy = busyId === r.id

						return (
							<Card key={r.id}>
								<CardHeader className="pb-2">
									<div className="flex items-center justify-between gap-2">
										<CardTitle className="text-base">
											{extracted?.merchant ?? r.type ?? "Receipt"}
										</CardTitle>
										<Badge variant={linked ? "default" : "outline"}>
											{linked
												? "Linked"
												: r.ai_processed
													? "AI parsed"
													: "Uploaded"}
										</Badge>
									</div>
									<CardDescription>
										{formatDate(r.created_at.split("T")[0], "full")}
									</CardDescription>
								</CardHeader>
								<CardContent className="flex flex-col gap-3">
									{src ? (
										<img
											alt=""
											className="max-h-48 w-full rounded-lg border border-border/60 object-cover"
											src={src}
										/>
									) : null}
									{extracted?.total != null ? (
										<p className="font-medium text-sm tabular-nums">
											Total:{" "}
											{formatMoney(Number(extracted.total), currency)}
											{extracted.category_suggestion
												? ` · ${extracted.category_suggestion}`
												: ""}
										</p>
									) : null}
									<div className="flex flex-wrap gap-2">
										{canExpense && accounts.length ? (
											<Button
												disabled={busy}
												onClick={() =>
													void runReceiptAction(r.id, () =>
														createExpenseFromReceipt(
															r.id,
															extracted!
														)
													)
												}
												size="sm"
												type="button"
											>
												Create expense
											</Button>
										) : null}
										{src && getGeminiApiKey() && !linked ? (
											<Button
												disabled={busy}
												onClick={() =>
													void runReceiptAction(r.id, () =>
														rescanReceipt(r.id, src)
													)
												}
												size="sm"
												type="button"
												variant="outline"
											>
												Re-scan
											</Button>
										) : null}
										<Button
											disabled={busy}
											onClick={() => {
												if (confirm("Delete this receipt?")) {
													void runReceiptAction(r.id, () =>
														removeReceipt(r.id)
													)
												}
											}}
											size="sm"
											type="button"
											variant="ghost"
										>
											Delete
										</Button>
									</div>
								</CardContent>
							</Card>
						)
					})
				)}
			</div>
		</div>
	)
}