import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
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
import { useTrackly } from "@/contexts/trackly-provider"

const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"]
const TYPES = ["income", "expense"]

function todayIso() {
	return new Date().toISOString().split("T")[0]
}

export function ScheduledPage() {
	const { scheduled, currency, addScheduled, removeScheduled } = useTrackly()
	const [type, setType] = useState("expense")
	const [amount, setAmount] = useState("")
	const [frequency, setFrequency] = useState("monthly")
	const [nextDate, setNextDate] = useState(todayIso())
	const [reason, setReason] = useState("")
	const [submitting, setSubmitting] = useState(false)
	const [formError, setFormError] = useState<string | null>(null)

	async function handleAdd(event: React.FormEvent) {
		event.preventDefault()
		const parsed = Number.parseFloat(amount)
		if (!parsed || parsed <= 0) {
			setFormError("Enter a valid amount.")
			return
		}
		if (!reason.trim()) {
			setFormError("Reason is required.")
			return
		}
		setSubmitting(true)
		setFormError(null)
		try {
			await addScheduled({
				type,
				amount: parsed,
				frequency,
				nextDate,
				reason: reason.trim(),
			})
			setAmount("")
			setReason("")
		} catch (err) {
			setFormError(err instanceof Error ? err.message : "Could not save")
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="flex flex-col gap-4">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">Scheduled</h1>
				<p className="text-muted-foreground text-sm">
					Recurring income and expenses stored in Supabase.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Add scheduled item</CardTitle>
					<CardDescription>Reminders for recurring money flows</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="grid grid-cols-1 gap-3 sm:grid-cols-2" onSubmit={handleAdd}>
						<Select onValueChange={setType} value={type}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{TYPES.map((t) => (
									<SelectItem key={t} value={t}>
										{t}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Input
							min="0"
							onChange={(e) => setAmount(e.target.value)}
							placeholder="Amount"
							step="0.01"
							type="number"
							value={amount}
						/>
						<Select onValueChange={setFrequency} value={frequency}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{FREQUENCIES.map((f) => (
									<SelectItem key={f} value={f}>
										{f}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Input
							onChange={(e) => setNextDate(e.target.value)}
							type="date"
							value={nextDate}
						/>
						<Input
							className="sm:col-span-2"
							onChange={(e) => setReason(e.target.value)}
							placeholder="Reason (e.g. Rent, Salary)"
							value={reason}
						/>
						{formError ? (
							<p className="text-destructive text-sm sm:col-span-2">{formError}</p>
						) : null}
						<Button className="sm:col-span-2" disabled={submitting} type="submit">
							{submitting ? "Saving…" : "Add scheduled"}
						</Button>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Active schedule</CardTitle>
					<CardDescription>{scheduled.length} items</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					{!scheduled.length ? (
						<p className="text-muted-foreground text-sm">Nothing scheduled yet.</p>
					) : (
						scheduled.map((row) => (
							<div
								className="flex flex-col gap-2 border-b border-border/60 pb-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
								key={row.id}
							>
								<div>
									<p className="font-medium">{row.reason || "Scheduled"}</p>
									<p className="text-muted-foreground text-sm">
										{formatDate(row.next_date, "full")} · {row.frequency}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<span className="font-medium tabular-nums">
										{formatMoney(Number(row.amount), currency)}
									</span>
									<Badge variant="outline">{row.type}</Badge>
									<Button
										onClick={() => {
											if (confirm("Delete this scheduled item?")) {
												void removeScheduled(row.id)
											}
										}}
										size="sm"
										variant="ghost"
									>
										Delete
									</Button>
								</div>
							</div>
						))
					)}
				</CardContent>
			</Card>
		</div>
	)
}