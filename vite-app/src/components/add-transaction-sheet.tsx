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
import { ShoppingListEditor } from "@/components/shopping-list-editor"
import { useTrackly } from "@/contexts/trackly-provider"
import {
	createShoppingRow,
	getShoppingGrandTotal,
	isShoppingCategory,
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
	const [shoppingItems, setShoppingItems] = useState<ShoppingListItem[]>([
		createShoppingRow(),
	])
	const [submitting, setSubmitting] = useState(false)
	const [formError, setFormError] = useState<string | null>(null)

	const filteredCategories = useMemo(
		() =>
			categories.filter((c) =>
				type === "income" ? c.type !== "expense" : c.type !== "income"
			),
		[categories, type]
	)

	const selectedCategory = useMemo(
		() => categories.find((c) => c.id === categoryId),
		[categories, categoryId]
	)

	const showShoppingList =
		type === "expense" && isShoppingCategory(selectedCategory)

	useEffect(() => {
		if (addTransactionOpen && transactionDraft?.projectId) {
			setProjectId(transactionDraft.projectId)
		}
	}, [addTransactionOpen, transactionDraft])

	useEffect(() => {
		if (!showShoppingList) return
		const total = getShoppingGrandTotal(shoppingItems)
		if (total > 0) {
			setAmount(String(total))
		}
	}, [shoppingItems, showShoppingList])

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
		setShoppingItems([createShoppingRow()])
		setFormError(null)
	}

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault()
		const parsedAmount = Number.parseFloat(amount)
		if (!parsedAmount || parsedAmount <= 0) {
			setFormError("Enter a valid amount.")
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

		setSubmitting(true)
		setFormError(null)
		try {
			await addTransaction({
				accountId,
				toAccountId: type === "transfer" ? toAccountId : undefined,
				categoryId: categoryId || null,
				type,
				amount: parsedAmount,
				currency: txnCurrency,
				reason: reason.trim(),
				note: note.trim() || null,
				projectId: projectId || null,
				date,
				shoppingList: showShoppingList ? shoppingItems : undefined,
			})
			setAddTransactionOpen(false)
			resetForm()
		} catch (err) {
			setFormError(err instanceof Error ? err.message : "Could not save transaction")
		} finally {
			setSubmitting(false)
		}
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
			<SheetContent className="flex flex-col gap-0 overflow-y-auto sm:max-w-md">
				<SheetHeader>
					<SheetTitle>Add transaction</SheetTitle>
					<SheetDescription>
						Log income, expense, or transfer. Balances update automatically.
					</SheetDescription>
				</SheetHeader>
				<form className="flex flex-1 flex-col gap-4 px-4 pb-4" onSubmit={handleSubmit}>
					<div className="flex flex-col gap-2">
						<span className="font-medium text-sm">Type</span>
						<Select
							onValueChange={(v) => setType(v as TracklyTransaction["type"])}
							value={type}
						>
							<SelectTrigger>
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
					{type !== "transfer" ? (
						<div className="flex flex-col gap-2">
							<span className="font-medium text-sm">Category</span>
							<Select onValueChange={setCategoryId} value={categoryId}>
								<SelectTrigger>
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
					{showShoppingList ? (
						<ShoppingListEditor
							currency={currency}
							items={shoppingItems}
							onChange={setShoppingItems}
						/>
					) : null}
					<div className="flex flex-col gap-2">
						<span className="font-medium text-sm">Amount</span>
						<Input
							min="0"
							onChange={(e) => setAmount(e.target.value)}
							placeholder="0.00"
							required
							step="0.01"
							type="number"
							value={amount}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<span className="font-medium text-sm">Account</span>
						<Select onValueChange={setAccountId} value={accountId}>
							<SelectTrigger>
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
					{type === "transfer" ? (
						<div className="flex flex-col gap-2">
							<span className="font-medium text-sm">To account</span>
							<Select onValueChange={setToAccountId} value={toAccountId}>
								<SelectTrigger>
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
						<span className="font-medium text-sm">Date</span>
						<Input
							onChange={(e) => setDate(e.target.value)}
							required
							type="date"
							value={date}
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
								<SelectTrigger>
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
					<SheetFooter className="px-0">
						<Button disabled={submitting || !accounts.length} type="submit">
							{submitting ? "Saving…" : "Save transaction"}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	)
}