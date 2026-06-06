import { dedupeCategories } from "@/lib/categories"
import type { ReceiptExtraction } from "@/lib/gemini"
import type { ShoppingListItem } from "@/lib/shopping-list"
import { formatShoppingNote, getValidShoppingItems } from "@/lib/shopping-list"
import { supabase } from "@/lib/supabase"
import type {
	TracklyAccount,
	TracklyBudget,
	TracklyCategory,
	TracklyProfile,
	TracklyProject,
	TracklyReceipt,
	TracklyScheduled,
	TracklyTransaction,
} from "@/types/trackly"

export type NewTransactionInput = {
	userId: string
	accountId: string
	toAccountId?: string
	categoryId?: string | null
	projectId?: string | null
	type: TracklyTransaction["type"]
	amount: number
	currency: string
	reason: string
	note?: string | null
	date: string
	shoppingList?: ShoppingListItem[]
}

export async function loadTracklyBundle(userId: string) {
	const [
		profileResult,
		accountsResult,
		transactionsResult,
		categoriesResult,
		budgetsResult,
		scheduledResult,
		receiptsResult,
		projectsResult,
	] = await Promise.all([
		supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
		supabase
			.from("accounts")
			.select("*")
			.eq("user_id", userId)
			.eq("is_active", true)
			.order("created_at"),
		supabase
			.from("transactions")
			.select("*, categories(name)")
			.eq("user_id", userId)
			.order("date", { ascending: false })
			.limit(500),
		supabase
			.from("categories")
			.select("*")
			.or(`is_default.eq.true,user_id.eq.${userId}`),
		supabase
			.from("budgets")
			.select("*, categories(name)")
			.eq("user_id", userId)
			.eq("is_active", true)
			.order("created_at", { ascending: false }),
		supabase
			.from("scheduled_transactions")
			.select("*, accounts(name), categories(name)")
			.eq("user_id", userId)
			.eq("is_active", true)
			.order("next_date"),
		supabase
			.from("receipts")
			.select("*")
			.eq("user_id", userId)
			.order("created_at", { ascending: false })
			.limit(100),
		supabase
			.from("projects")
			.select("*")
			.eq("user_id", userId)
			.order("created_at", { ascending: false }),
	])

	let transactions = (transactionsResult.data as TracklyTransaction[] | null) ?? []
	if (transactionsResult.error) {
		const fallback = await supabase
			.from("transactions")
			.select("*")
			.eq("user_id", userId)
			.order("date", { ascending: false })
			.limit(500)
		transactions = (fallback.data as TracklyTransaction[] | null) ?? []
	}

	return {
		profile: (profileResult.data as TracklyProfile | null) ?? null,
		accounts: (accountsResult.data as TracklyAccount[] | null) ?? [],
		transactions,
		categories: dedupeCategories(
			(categoriesResult.data as TracklyCategory[] | null) ?? []
		),
		budgets: (budgetsResult.data as TracklyBudget[] | null) ?? [],
		scheduled: (scheduledResult.data as TracklyScheduled[] | null) ?? [],
		receipts: (receiptsResult.data as TracklyReceipt[] | null) ?? [],
		projects: (projectsResult.data as TracklyProject[] | null) ?? [],
	}
}

export async function createScheduled(input: {
	userId: string
	type: string
	amount: number
	frequency: string
	nextDate: string
	reason: string
}) {
	const { error } = await supabase.from("scheduled_transactions").insert({
		user_id: input.userId,
		type: input.type,
		amount: input.amount,
		frequency: input.frequency,
		next_date: input.nextDate,
		reason: input.reason,
		is_active: true,
	})
	if (error) throw new Error(error.message)
}

export async function deleteScheduled(userId: string, id: string) {
	const { error } = await supabase
		.from("scheduled_transactions")
		.delete()
		.eq("id", id)
		.eq("user_id", userId)
	if (error) throw new Error(error.message)
}

export async function createReceipt(input: {
	userId: string
	type: string
	imageUrl: string
}) {
	const { data, error } = await supabase
		.from("receipts")
		.insert({
			user_id: input.userId,
			transaction_id: null,
			type: input.type,
			image_url: input.imageUrl,
			extracted_data: null,
			ai_processed: false,
			created_at: new Date().toISOString(),
		})
		.select()
		.single()
	if (error) throw new Error(error.message)
	return data as TracklyReceipt
}

export async function updateReceipt(
	id: string,
	patch: Partial<
		Pick<TracklyReceipt, "extracted_data" | "ai_processed" | "transaction_id">
	>
) {
	const { error } = await supabase.from("receipts").update(patch).eq("id", id)
	if (error) throw new Error(error.message)
}

function todayIso() {
	return new Date().toISOString().split("T")[0]
}

function parseTransferDestination(note: string | null | undefined) {
	if (!note?.includes("→")) return null
	return note.split("→")[1]?.split("·")[0]?.trim() ?? null
}

async function applyBalanceDelta(
	accountId: string,
	currentBalance: number,
	delta: number
) {
	const { error } = await supabase
		.from("accounts")
		.update({ balance: currentBalance + delta })
		.eq("id", accountId)
	if (error) throw new Error(error.message)
}

export async function deleteTransaction(
	userId: string,
	txn: TracklyTransaction,
	accounts: TracklyAccount[]
) {
	const amount = Number(txn.amount)
	const fromAccount = accounts.find((a) => a.id === txn.account_id)

	if (fromAccount) {
		if (txn.type === "income") {
			await applyBalanceDelta(txn.account_id, Number(fromAccount.balance), -amount)
		} else if (txn.type === "expense") {
			await applyBalanceDelta(txn.account_id, Number(fromAccount.balance), amount)
		} else if (txn.type === "transfer") {
			const destName = parseTransferDestination(txn.note)
			const toAccount = destName
				? accounts.find((a) => a.name === destName)
				: undefined
			if (toAccount) {
				await Promise.all([
					applyBalanceDelta(
						txn.account_id,
						Number(fromAccount.balance),
						amount
					),
					applyBalanceDelta(toAccount.id, Number(toAccount.balance), -amount),
				])
			}
		}
	}

	await supabase
		.from("receipts")
		.update({ transaction_id: null })
		.eq("transaction_id", txn.id)

	const { error } = await supabase
		.from("transactions")
		.delete()
		.eq("id", txn.id)
		.eq("user_id", userId)
	if (error) throw new Error(error.message)
}

export async function createCategory(input: {
	userId: string
	name: string
	type: "income" | "expense"
}) {
	const { error } = await supabase.from("categories").insert({
		user_id: input.userId,
		name: input.name.trim(),
		type: input.type,
		is_default: false,
	})
	if (error) throw new Error(error.message)
}

export async function linkReceiptToTransaction(
	receiptId: string,
	transactionId: string
) {
	await updateReceipt(receiptId, { transaction_id: transactionId })
}

export async function createTransactionFromReceipt(
	userId: string,
	receiptId: string,
	extracted: ReceiptExtraction,
	categories: TracklyCategory[],
	accounts: TracklyAccount[],
	defaultCurrency: string
) {
	const accountId = accounts[0]?.id
	if (!accountId) {
		throw new Error("Create an account before logging receipt expenses.")
	}

	const suggestion = (extracted.category_suggestion ?? "").toLowerCase()
	const category =
		categories.find((c) => c.name.toLowerCase() === suggestion) ??
		categories.find((c) => c.type === "expense") ??
		categories[0]

	const txn = await createTransaction(
		{
			userId,
			accountId,
			categoryId: category?.id ?? null,
			type: "expense",
			amount: Number(extracted.total) || 0,
			currency: (extracted.currency ?? defaultCurrency).toUpperCase(),
			reason: extracted.merchant?.trim() || "Receipt purchase",
			note: "From receipt",
			date: extracted.date ?? todayIso(),
		},
		accounts,
		categories
	)

	if (txn?.id) {
		await linkReceiptToTransaction(receiptId, txn.id)
	}

	return txn
}

export async function deleteReceipt(userId: string, receiptId: string) {
	const { error } = await supabase
		.from("receipts")
		.delete()
		.eq("id", receiptId)
		.eq("user_id", userId)
	if (error) throw new Error(error.message)
}

export async function createProject(input: {
	userId: string
	name: string
	description: string
	budget: number
}) {
	const { error } = await supabase.from("projects").insert({
		user_id: input.userId,
		name: input.name,
		description: input.description,
		budget: input.budget,
		created_at: new Date().toISOString(),
	})
	if (error) throw new Error(error.message)
}

export async function deleteProject(userId: string, id: string) {
	const { error } = await supabase
		.from("projects")
		.delete()
		.eq("id", id)
		.eq("user_id", userId)
	if (error) throw new Error(error.message)
}

export async function upsertProfile(input: {
	userId: string
	fullName?: string
	currency?: string
	email?: string
}) {
	const row: Record<string, string> = {
		id: input.userId,
		updated_at: new Date().toISOString(),
	}
	if (input.fullName) row.full_name = input.fullName
	if (input.currency) row.currency = input.currency
	if (input.email) row.email = input.email

	const { error } = await supabase.from("profiles").upsert(row)
	if (error) throw new Error(error.message)
}

export async function createTransaction(
	input: NewTransactionInput,
	accounts: TracklyAccount[],
	categories: TracklyCategory[] = []
) {
	const txnDate = input.date
		? new Date(`${input.date}T12:00:00`).toISOString()
		: new Date().toISOString()

	const transferNote =
		input.type === "transfer" && input.toAccountId
			? `→ ${accounts.find((a) => a.id === input.toAccountId)?.name ?? "account"}${input.note ? ` · ${input.note}` : ""}`
			: null
	const shoppingItems = getValidShoppingItems(input.shoppingList ?? [])
	const shoppingNote = shoppingItems.length
		? formatShoppingNote(shoppingItems, input.currency, categories)
		: null
	const noteParts = [transferNote, input.note?.trim(), shoppingNote].filter(Boolean)
	const note = noteParts.length ? noteParts.join("\n\n") : null

	const row: Record<string, unknown> = {
		user_id: input.userId,
		account_id: input.accountId,
		category_id: input.categoryId || null,
		type: input.type,
		amount: input.amount,
		currency: input.currency,
		reason: input.reason,
		note,
		date: txnDate,
	}
	if (input.projectId) {
		row.project_id = input.projectId
	}
	if (shoppingItems.length) {
		row.shopping_list = JSON.stringify(shoppingItems)
	}

	const { data, error } = await supabase.from("transactions").insert(row).select()

	if (error) {
		throw new Error(error.message)
	}

	const fromAccount = accounts.find((a) => a.id === input.accountId)
	if (fromAccount) {
		if (input.type === "income") {
			await supabase
				.from("accounts")
				.update({ balance: Number(fromAccount.balance) + input.amount })
				.eq("id", input.accountId)
		} else if (input.type === "expense") {
			await supabase
				.from("accounts")
				.update({ balance: Number(fromAccount.balance) - input.amount })
				.eq("id", input.accountId)
		} else if (input.type === "transfer" && input.toAccountId) {
			const toAccount = accounts.find((a) => a.id === input.toAccountId)
			if (toAccount) {
				await Promise.all([
					supabase
						.from("accounts")
						.update({ balance: Number(fromAccount.balance) - input.amount })
						.eq("id", input.accountId),
					supabase
						.from("accounts")
						.update({ balance: Number(toAccount.balance) + input.amount })
						.eq("id", input.toAccountId),
				])
			}
		}
	}

	return data?.[0] as TracklyTransaction | undefined
}

export async function createAccount(input: {
	userId: string
	name: string
	type: string
	currency: string
	balance: number
}) {
	const { error } = await supabase.from("accounts").insert({
		user_id: input.userId,
		name: input.name,
		type: input.type,
		currency: input.currency,
		balance: input.balance,
		is_active: true,
	})

	if (error) {
		throw new Error(error.message)
	}
}

export async function deactivateAccount(userId: string, accountId: string) {
	const { error } = await supabase
		.from("accounts")
		.update({ is_active: false })
		.eq("id", accountId)
		.eq("user_id", userId)
	if (error) throw new Error(error.message)
}

export async function createBudget(input: {
	userId: string
	categoryId: string
	limitAmount: number
	period?: string
}) {
	const { error } = await supabase.from("budgets").insert({
		user_id: input.userId,
		category_id: input.categoryId,
		limit_amount: input.limitAmount,
		amount: input.limitAmount,
		period: input.period ?? "monthly",
		is_active: true,
	})
	if (error) throw new Error(error.message)
}

export async function listAdminProfiles() {
	const { data, error } = await supabase
		.from("profiles")
		.select("id, full_name, username, currency, created_at, updated_at")
		.order("created_at", { ascending: false })
		.limit(200)
	if (error) throw new Error(error.message)
	return data ?? []
}

export async function deactivateBudget(userId: string, budgetId: string) {
	const { error } = await supabase
		.from("budgets")
		.update({ is_active: false })
		.eq("id", budgetId)
		.eq("user_id", userId)
	if (error) throw new Error(error.message)
}