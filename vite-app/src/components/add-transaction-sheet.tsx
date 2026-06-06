"use client"

import { useEffect, useMemo, useState } from "react"
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
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet"
import { ExpenseLineItemsEditor } from "@/components/expense-line-items-editor"
import { filterCategoriesByTxnType } from "@/lib/categories"
import { useTrackly } from "@/contexts/trackly-provider"
import {
	createShoppingRow,
	getShoppingGrandTotal,
	getValidShoppingItems,
	resolvePrimaryCategoryId,
	type ShoppingListItem,
} from "@/lib/shopping-list"
import type { TracklyTransaction } from "@/types/trackly"

const TXN_TYPES: TracklyTransaction["type"][] = ["expense", "income", "transfer"]

function todayIso() {
	return new Date().toISOString().split("T")[0]
}

export function AddTransactionSheet() {
	const {
		accounts,
		categories,
		projects,
		currency,
		addTransaction,
		addTransactionOpen,
		setAddTransactionOpen,
		transactionDraft,
	} = useTrackly()

	const [type, setType] = useState<TracklyTransaction["type"]>("expense")
	const [amount, setAmount] = useState("")
	const [accountId, setAccountId] = useState("")
	const [toAccountId, setToAccountId] = useState("")
	const [categoryId, setCategoryId] = useState("")
	const [reason, setReason] = useState("")
	const [note, setNote] = useState("")
	const [projectId, setProjectId] = useState("")
	const [date, setDate] = useState(todayIso())
	const [lineItems, setLineItems] = useState<ShoppingListItem[]>([
		createShoppingRow(),
	])
	const [submitting, setSubmitting] = useState(false)
	const [formError, setFormError] = useState<string | null>(null)

	const filteredCategories = useMemo(
		() => filterCategoriesByTxnType(categories, type),
		[categories, type]
	)

	const expenseCategories = useMemo(
		() => filterCategoriesByTxnType(categories, "expense"),
		[categories]
	)

	const showLineItems = type === "expense"
	const validLineItems = useMemo(
		() => getValidShoppingItems(lineItems),
		[lineItems]
	)
	const lineItemsTotal = useMemo(
		() => getShoppingGrandTotal(lineItems),
		[lineItems]
	)
	const amountFromLines = showLineItems && validLineItems.length > 0

	useEffect(() => {
		if (addTransactionOpen && transactionDraft?.projectId) {
			setProjectId(transactionDraft.projectId)
		}
	}, [addTransactionOpen, transactionDraft])

	useEffect(() => {
		if (!showLineItems) return
		if (lineItemsTotal > 0) {
			setAmount(String(lineItemsTotal))
		}
	}, [lineItemsTotal, showLineItems])

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault()
		const parsedAmount = amountFromLines
			? lineItemsTotal
			: Number.parseFloat(amount)
		if (!parsedAmount || parsedAmount <= 0) {
			setFormError(
				amountFromLines
					? "Add at least one line item with a name and amount."
					: "Enter a valid amount."
			)
			return
		}
		if (!reason.trim()) {
			setFormError("A reason is required.")
			return
		}
		if (!accountId) {
			setFormError("Select an account.")
			return
		}
		if (type === "transfer") {
			if (!toAccountId) {
				setFormError("Select a destination account.")
				return
			}
			if (toAccountId === accountId) {
				setFormError("Source and destination accounts must be different.")
				return
			}
		}

		const selectedAccount = accounts.find((a) => a.id === accountId)
		const txnCurrency = (selectedAccount?.currency ?? currency).toUpperCase()
		const resolvedCategoryId = amountFromLines
			? resolvePrimaryCategoryId(lineItems)
			: categoryId || null

		setSubmitting(true)
		setFormError(null)
		try {
			await addTransaction({
				accountId,
				toAccountId: type === "transfer" ? toAccountId : undefined,
				categoryId: resolvedCategoryId,
				type,
				amount: parsedAmount,
				currency: txnCurrency,
				reason: reason.trim(),
				note: note.trim() || null,
				projectId: projectId || null,
				date,
				shoppingList: amountFromLines ? lineItems : undefined,
			})
			setAddTransactionOpen(false)
			resetForm()
		} catch (err) {
			setFormError(err instanceof Error ? err.message : "Could not save transaction")
		} finally {
			setSubmitting(false)
		}
	}

	function resetForm() {
		setType("expense")
		setAmount("")
		setAccountId(accounts[0]?.id ?? "")
		setToAccountId("")
		setCategoryId("")
		setReason("")
		setNote("")
		setProjectId("")
		setDate(todayIso())
		setLineItems([createShoppingRow()])
		setFormError(null)
	}

	return (
		<Sheet
			onOpenChange={(open) => {
				setAddTransactionOpen(open)
				if (open && accounts.length && !accountId) {
					setAccountId(accounts[0].id)
				}
				if (!open) {
					resetForm()
				}
			}}
			open={addTransactionOpen}
		>
			<SheetContent className="trackly-glass flex w-full flex-col gap-0 overflow-y-auto border-white/12 bg-popover/75 p-0 backdrop-blur-2xl sm:max-w-lg">
				<SheetHeader className="border-white/10 border-b px-4 py-4 sm:px-6">
					<SheetTitle>Add transaction</SheetTitle>
					<SheetDescription>
						Log income, expense, or transfer. Balances update automatically.
					</SheetDescription>
				</SheetHeader>
				<form
					className="flex flex-1 flex-col gap-4 px-4 py-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-6"
					onSubmit={handleSubmit}
				>
					<div className="flex flex-col gap-2">
						<span className="font-medium text-sm">Type</span>
						<Select
							onValueChange={(v) => setType(v as TracklyTransaction["type"])}
							value={type}
						>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{TXN_TYPES.map((t) => (
									<SelectItem key={t} value={t}>
										{t.charAt(0).toUpperCase() + t.slice(1)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{showLineItems ? (
						<ExpenseLineItemsEditor
							categories={expenseCategories}
							currency={currency}
							items={lineItems}
							onChange={setLineItems}
						/>
					) : null}

					{type !== "transfer" && !showLineItems ? (
						<div className="flex flex-col gap-2">
							<span className="font-medium text-sm">Category</span>
							<Select onValueChange={setCategoryId} value={categoryId}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Optional category" />
								</SelectTrigger>
								<SelectContent>
									{filteredCategories.map((c) => (
										<SelectItem key={c.id} value={c.id}>
											{c.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					) : null}

					<div className="flex flex-col gap-2">
						<span className="font-medium text-sm">
							{amountFromLines ? "Total (from lines)" : "Amount"}
						</span>
						<Input
							className={amountFromLines ? "bg-muted/40" : undefined}
							disabled={amountFromLines}
							min="0"
							onChange={(e) => setAmount(e.target.value)}
							placeholder="0.00"
							readOnly={amountFromLines}
							required={!amountFromLines}
							step="0.01"
							type="number"
							value={amount}
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="flex flex-col gap-2">
							<span className="font-medium text-sm">Account</span>
							<Select onValueChange={setAccountId} value={accountId}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select account" />
								</SelectTrigger>
								<SelectContent>
									{accounts.map((a) => (
										<SelectItem key={a.id} value={a.id}>
											{a.name} ({a.type})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col gap-2">
							<span className="font-medium text-sm">Date</span>
							<Input
								onChange={(e) => setDate(e.target.value)}
								required
								type="date"
								value={date}
							/>
						</div>
					</div>

					{type === "transfer" ? (
						<div className="flex flex-col gap-2">
							<span className="font-medium text-sm">To account</span>
							<Select onValueChange={setToAccountId} value={toAccountId}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Destination account" />
								</SelectTrigger>
								<SelectContent>
									{accounts
										.filter((a) => a.id !== accountId)
										.map((a) => (
											<SelectItem key={a.id} value={a.id}>
												{a.name}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</div>
					) : null}

					<div className="flex flex-col gap-2">
						<span className="font-medium text-sm">Reason</span>
						<Input
							onChange={(e) => setReason(e.target.value)}
							placeholder="What was this for?"
							required
							value={reason}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<span className="font-medium text-sm">Note</span>
						<Input
							onChange={(e) => setNote(e.target.value)}
							placeholder="Optional note"
							value={note}
						/>
					</div>

					{projects.length ? (
						<div className="flex flex-col gap-2">
							<span className="font-medium text-sm">Project</span>
							<Select
								onValueChange={(v) =>
									setProjectId(v === "__none__" ? "" : v)
								}
								value={projectId || "__none__"}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Optional project" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="__none__">None</SelectItem>
									{projects.map((p) => (
										<SelectItem key={p.id} value={p.id}>
											{p.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					) : null}

					{formError ? (
						<p className="text-destructive text-sm">{formError}</p>
					) : null}

					<SheetFooter className="fixed inset-x-0 bottom-0 z-10 border-white/10 border-t bg-popover/90 px-4 py-3 backdrop-blur-xl sm:static sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
						<Button
							className="w-full sm:w-auto"
							disabled={submitting || !accounts.length}
							type="submit"
						>
							{submitting ? "Saving…" : "Save transaction"}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	)
}