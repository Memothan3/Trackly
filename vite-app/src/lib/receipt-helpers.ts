import type { ReceiptExtraction } from "@/lib/gemini"
import type { TracklyReceipt } from "@/types/trackly"

export function parseReceiptExtraction(
	receipt: TracklyReceipt
): ReceiptExtraction | null {
	const raw = receipt.extracted_data
	if (!raw || typeof raw !== "object") return null
	return raw as ReceiptExtraction
}

export function canCreateExpenseFromReceipt(receipt: TracklyReceipt) {
	if (receipt.transaction_id) return false
	const extracted = parseReceiptExtraction(receipt)
	return Boolean(extracted?.total && extracted.total > 0)
}