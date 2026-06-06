"use client"

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
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet"
import { useTrackly } from "@/contexts/trackly-provider"

const ACCOUNT_TYPES = ["wallet", "bank", "card", "cash", "savings"] as const

export function AddAccountSheet() {
	const { currency, addAccount, addAccountOpen, setAddAccountOpen } = useTrackly()
	const [name, setName] = useState("")
	const [type, setType] = useState<string>("wallet")
	const [acctCurrency, setAcctCurrency] = useState(currency)
	const [balance, setBalance] = useState("0")
	const [submitting, setSubmitting] = useState(false)
	const [formError, setFormError] = useState<string | null>(null)

	function resetForm() {
		setName("")
		setType("wallet")
		setAcctCurrency(currency)
		setBalance("0")
		setFormError(null)
	}

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault()
		if (!name.trim()) {
			setFormError("Account name is required.")
			return
		}

		setSubmitting(true)
		setFormError(null)
		try {
			await addAccount({
				name: name.trim(),
				type,
				currency: acctCurrency.toUpperCase(),
				balance: Number.parseFloat(balance) || 0,
			})
			setAddAccountOpen(false)
			resetForm()
		} catch (err) {
			setFormError(err instanceof Error ? err.message : "Could not create account")
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<Sheet
			onOpenChange={(open) => {
				setAddAccountOpen(open)
				if (!open) {
					resetForm()
				}
			}}
			open={addAccountOpen}
		>
			<SheetContent className="trackly-glass flex w-full flex-col gap-0 overflow-y-auto border-white/12 bg-popover/75 p-0 backdrop-blur-2xl sm:max-w-md">
				<SheetHeader className="border-white/10 border-b px-4 py-4 sm:px-6">
					<SheetTitle>Add account</SheetTitle>
					<SheetDescription>
						Track a bank, wallet, card, or cash balance.
					</SheetDescription>
				</SheetHeader>
				<form
					className="flex flex-1 flex-col gap-4 px-4 py-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-6"
					onSubmit={handleSubmit}
				>
					<div className="flex flex-col gap-2">
						<span className="font-medium text-sm">Name</span>
						<Input
							onChange={(e) => setName(e.target.value)}
							placeholder="Main checking"
							required
							value={name}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<span className="font-medium text-sm">Type</span>
						<Select onValueChange={setType} value={type}>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{ACCOUNT_TYPES.map((t) => (
									<SelectItem key={t} value={t}>
										{t.charAt(0).toUpperCase() + t.slice(1)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="flex flex-col gap-2">
							<span className="font-medium text-sm">Currency</span>
							<Input
								onChange={(e) => setAcctCurrency(e.target.value)}
								placeholder="USD"
								value={acctCurrency}
							/>
						</div>
						<div className="flex flex-col gap-2">
							<span className="font-medium text-sm">Opening balance</span>
							<Input
								min="0"
								onChange={(e) => setBalance(e.target.value)}
								step="0.01"
								type="number"
								value={balance}
							/>
						</div>
					</div>
					{formError ? (
						<p className="text-destructive text-sm">{formError}</p>
					) : null}
					<SheetFooter className="fixed inset-x-0 bottom-0 z-10 border-white/10 border-t bg-popover/90 px-4 py-3 backdrop-blur-xl sm:static sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
						<Button className="w-full sm:w-auto" disabled={submitting} type="submit">
							{submitting ? "Saving…" : "Create account"}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	)
}