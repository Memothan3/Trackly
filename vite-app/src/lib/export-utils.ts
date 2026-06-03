function todayStamp() {
	return new Date().toISOString().split("T")[0]
}

function escapeCsvCell(value: unknown) {
	const text = String(value ?? "")
	if (/[",\n\r]/.test(text)) {
		return `"${text.replace(/"/g, '""')}"`
	}
	return text
}

export function toCsv(rows: Record<string, unknown>[]) {
	if (!rows.length) return ""
	const headers = Object.keys(rows[0])
	const lines = [
		headers.join(","),
		...rows.map((row) =>
			headers.map((key) => escapeCsvCell(row[key])).join(",")
		),
	]
	return lines.join("\n")
}

export function downloadFile(filename: string, content: string, mime: string) {
	const blob = new Blob([content], { type: mime })
	const url = URL.createObjectURL(blob)
	const anchor = document.createElement("a")
	anchor.href = url
	anchor.download = filename
	anchor.click()
	URL.revokeObjectURL(url)
}

export function exportTransactionsCsv(
	transactions: Array<{
		date: string
		type: string
		amount: number
		reason?: string | null
		note?: string | null
		categories?: { name?: string } | null
	}>
) {
	const rows = transactions.map((t) => ({
		date: t.date,
		type: t.type,
		amount: t.amount,
		reason: t.reason || "",
		note: t.note || "",
		category: t.categories?.name || "",
	}))
	if (!rows.length) return false
	downloadFile(
		`trackly-transactions-${todayStamp()}.csv`,
		toCsv(rows),
		"text/csv;charset=utf-8"
	)
	return true
}

export function exportAccountsCsv(
	accounts: Array<{
		name: string
		type: string
		balance: number
		currency?: string | null
		bank_name?: string | null
	}>
) {
	const rows = accounts.map((a) => ({
		name: a.name,
		type: a.type,
		balance: a.balance,
		currency: a.currency || "USD",
		bank_name: a.bank_name || "",
	}))
	if (!rows.length) return false
	downloadFile(
		`trackly-accounts-${todayStamp()}.csv`,
		toCsv(rows),
		"text/csv;charset=utf-8"
	)
	return true
}

export function exportSnapshotJson(snapshot: Record<string, unknown>) {
	downloadFile(
		`trackly-snapshot-${todayStamp()}.json`,
		JSON.stringify(snapshot, null, 2),
		"application/json;charset=utf-8"
	)
}