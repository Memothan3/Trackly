"use client"

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react"
import {
	onIdTokenChanged,
	signOut as firebaseSignOut,
	type User,
} from "firebase/auth"
import { syncUserProfile } from "@/lib/auth-service"
import { tracklyConfig } from "@/lib/config"
import { firebaseAuth } from "@/lib/firebase"
import {
	createAccount,
	createBudget,
	createCategory,
	createProject,
	createReceipt,
	createScheduled,
	createTransaction,
	createTransactionFromReceipt,
	deactivateAccount,
	deactivateBudget,
	deleteProject,
	deleteReceipt,
	deleteScheduled,
	deleteTransaction,
	loadTracklyBundle,
	updateReceipt,
	upsertProfile,
	type NewTransactionInput,
} from "@/lib/trackly-api"
import { extractReceiptFromImage, type ReceiptExtraction } from "@/lib/gemini"
import {
	buildCategoryMix,
	buildDashboardStats,
	buildExpenseTrendData,
	buildIncomeChartData,
} from "@/lib/trackly-metrics"
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

type TracklyContextValue = {
	user: User | null
	profile: TracklyProfile | null
	accounts: TracklyAccount[]
	transactions: TracklyTransaction[]
	categories: TracklyCategory[]
	budgets: TracklyBudget[]
	scheduled: TracklyScheduled[]
	receipts: TracklyReceipt[]
	projects: TracklyProject[]
	currency: string
	loading: boolean
	error: string | null
	stats: ReturnType<typeof buildDashboardStats>
	incomeChartData: ReturnType<typeof buildIncomeChartData>
	expenseTrend: ReturnType<typeof buildExpenseTrendData>
	categoryMix: ReturnType<typeof buildCategoryMix>
	signOut: () => Promise<void>
	refresh: () => Promise<void>
	addTransaction: (input: Omit<NewTransactionInput, "userId">) => Promise<void>
	removeTransaction: (transactionId: string) => Promise<void>
	addAccount: (input: {
		name: string
		type: string
		currency: string
		balance: number
	}) => Promise<void>
	deactivateAccount: (accountId: string) => Promise<void>
	addBudget: (input: {
		categoryId: string
		limitAmount: number
		period?: string
	}) => Promise<void>
	removeBudget: (budgetId: string) => Promise<void>
	addScheduled: (input: {
		type: string
		amount: number
		frequency: string
		nextDate: string
		reason: string
	}) => Promise<void>
	removeScheduled: (id: string) => Promise<void>
	uploadReceipt: (file: File, type: string, runAi: boolean) => Promise<void>
	createExpenseFromReceipt: (receiptId: string, extracted: ReceiptExtraction) => Promise<void>
	rescanReceipt: (receiptId: string, imageUrl: string) => Promise<void>
	removeReceipt: (receiptId: string) => Promise<void>
	addCategory: (input: { name: string; type: "income" | "expense" }) => Promise<void>
	addProject: (input: {
		name: string
		description: string
		budget: number
	}) => Promise<void>
	removeProject: (id: string) => Promise<void>
	updateProfile: (input: { fullName?: string; currency?: string }) => Promise<void>
	isAdmin: boolean
	transactionDraft: { projectId?: string } | null
	addTransactionOpen: boolean
	setAddTransactionOpen: (open: boolean) => void
	openAddTransaction: (draft?: { projectId?: string }) => void
	addAccountOpen: boolean
	setAddAccountOpen: (open: boolean) => void
}

const TracklyContext = createContext<TracklyContextValue | null>(null)

export function TracklyProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [profile, setProfile] = useState<TracklyProfile | null>(null)
	const [accounts, setAccounts] = useState<TracklyAccount[]>([])
	const [transactions, setTransactions] = useState<TracklyTransaction[]>([])
	const [categories, setCategories] = useState<TracklyCategory[]>([])
	const [budgets, setBudgets] = useState<TracklyBudget[]>([])
	const [scheduled, setScheduled] = useState<TracklyScheduled[]>([])
	const [receipts, setReceipts] = useState<TracklyReceipt[]>([])
	const [projects, setProjects] = useState<TracklyProject[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [addTransactionOpen, setAddTransactionOpenState] = useState(false)
	const [transactionDraft, setTransactionDraft] = useState<{
		projectId?: string
	} | null>(null)
	const [addAccountOpen, setAddAccountOpen] = useState(false)

	const setAddTransactionOpen = useCallback((open: boolean) => {
		if (!open) {
			setTransactionDraft(null)
		} else {
			setTransactionDraft(null)
		}
		setAddTransactionOpenState(open)
	}, [])

	const openAddTransaction = useCallback((draft?: { projectId?: string }) => {
		setTransactionDraft(draft ?? null)
		setAddTransactionOpenState(true)
	}, [])

	const applyBundle = useCallback(
		(data: Awaited<ReturnType<typeof loadTracklyBundle>>) => {
			setProfile(data.profile)
			setAccounts(data.accounts)
			setTransactions(data.transactions)
			setCategories(data.categories)
			setBudgets(data.budgets)
			setScheduled(data.scheduled)
			setReceipts(data.receipts)
			setProjects(data.projects)
		},
		[]
	)

	const refresh = useCallback(async () => {
		if (!user) return
		setError(null)
		try {
			const data = await loadTracklyBundle(user.uid)
			applyBundle(data)
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load Trackly data")
		}
	}, [user, applyBundle])

	useEffect(() => {
		const unsubscribe = onIdTokenChanged(firebaseAuth, async (firebaseUser) => {
			if (!firebaseUser) {
				setUser(null)
				setProfile(null)
				setAccounts([])
				setTransactions([])
				setCategories([])
				setBudgets([])
				setScheduled([])
				setReceipts([])
				setProjects([])
				setLoading(false)
				return
			}

			setUser(firebaseUser)
			setLoading(true)
			setError(null)

			try {
				// Fresh token so Supabase sees role:authenticated (Firebase custom claim)
				await firebaseUser.getIdToken(true)
				let data = await loadTracklyBundle(firebaseUser.uid)

				if (firebaseUser.email && !data.profile?.email) {
					await syncUserProfile(firebaseUser)
					data = await loadTracklyBundle(firebaseUser.uid)
				}

				applyBundle(data)
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to initialize Trackly"
				)
			} finally {
				setLoading(false)
			}
		})

		return unsubscribe
	}, [applyBundle])

	const addTransaction = useCallback(
		async (input: Omit<NewTransactionInput, "userId">) => {
			if (!user) throw new Error("Not signed in")
			await createTransaction({ ...input, userId: user.uid }, accounts, categories)
			await refresh()
		},
		[user, accounts, categories, refresh]
	)

	const removeTransaction = useCallback(
		async (transactionId: string) => {
			if (!user) throw new Error("Not signed in")
			const txn = transactions.find((t) => t.id === transactionId)
			if (!txn) throw new Error("Transaction not found")
			await deleteTransaction(user.uid, txn, accounts)
			await refresh()
		},
		[user, transactions, accounts, refresh]
	)

	const addAccount = useCallback(
		async (input: {
			name: string
			type: string
			currency: string
			balance: number
		}) => {
			if (!user) throw new Error("Not signed in")
			await createAccount({ ...input, userId: user.uid })
			await refresh()
		},
		[user, refresh]
	)

	const deactivateAccountFn = useCallback(
		async (accountId: string) => {
			if (!user) throw new Error("Not signed in")
			await deactivateAccount(user.uid, accountId)
			await refresh()
		},
		[user, refresh]
	)

	const addBudget = useCallback(
		async (input: {
			categoryId: string
			limitAmount: number
			period?: string
		}) => {
			if (!user) throw new Error("Not signed in")
			await createBudget({ ...input, userId: user.uid })
			await refresh()
		},
		[user, refresh]
	)

	const removeBudget = useCallback(
		async (budgetId: string) => {
			if (!user) throw new Error("Not signed in")
			await deactivateBudget(user.uid, budgetId)
			await refresh()
		},
		[user, refresh]
	)

	const addScheduled = useCallback(
		async (input: {
			type: string
			amount: number
			frequency: string
			nextDate: string
			reason: string
		}) => {
			if (!user) throw new Error("Not signed in")
			await createScheduled({ ...input, userId: user.uid })
			await refresh()
		},
		[user, refresh]
	)

	const removeScheduled = useCallback(
		async (id: string) => {
			if (!user) throw new Error("Not signed in")
			await deleteScheduled(user.uid, id)
			await refresh()
		},
		[user, refresh]
	)

	const currency = (profile?.currency ?? tracklyConfig.defaultCurrency).toUpperCase()
	const isAdmin =
		user?.email?.toLowerCase() === tracklyConfig.adminEmail.toLowerCase()

	const createExpenseFromReceipt = useCallback(
		async (receiptId: string, extracted: ReceiptExtraction) => {
			if (!user) throw new Error("Not signed in")
			await createTransactionFromReceipt(
				user.uid,
				receiptId,
				extracted,
				categories,
				accounts,
				currency
			)
			await refresh()
		},
		[user, categories, accounts, currency, refresh]
	)

	const rescanReceipt = useCallback(
		async (receiptId: string, imageUrl: string) => {
			if (!user) throw new Error("Not signed in")
			const extracted = await extractReceiptFromImage(imageUrl)
			if (extracted) {
				await updateReceipt(receiptId, {
					extracted_data: extracted,
					ai_processed: true,
				})
			}
			await refresh()
		},
		[user, refresh]
	)

	const removeReceiptFn = useCallback(
		async (receiptId: string) => {
			if (!user) throw new Error("Not signed in")
			await deleteReceipt(user.uid, receiptId)
			await refresh()
		},
		[user, refresh]
	)

	const addCategory = useCallback(
		async (input: { name: string; type: "income" | "expense" }) => {
			if (!user) throw new Error("Not signed in")
			await createCategory({ ...input, userId: user.uid })
			await refresh()
		},
		[user, refresh]
	)

	const uploadReceipt = useCallback(
		async (file: File, type: string, runAi: boolean) => {
			if (!user) throw new Error("Not signed in")
			const dataUrl = await new Promise<string>((resolve, reject) => {
				const reader = new FileReader()
				reader.onload = () => resolve(String(reader.result))
				reader.onerror = () => reject(new Error("Could not read file"))
				reader.readAsDataURL(file)
			})
			const receipt = await createReceipt({
				userId: user.uid,
				type,
				imageUrl: dataUrl,
			})
			if (runAi) {
				const extracted = await extractReceiptFromImage(dataUrl)
				if (extracted) {
					await updateReceipt(receipt.id, {
						extracted_data: extracted,
						ai_processed: true,
					})
				}
			}
			await refresh()
		},
		[user, refresh]
	)

	const addProject = useCallback(
		async (input: { name: string; description: string; budget: number }) => {
			if (!user) throw new Error("Not signed in")
			await createProject({ ...input, userId: user.uid })
			await refresh()
		},
		[user, refresh]
	)

	const removeProject = useCallback(
		async (id: string) => {
			if (!user) throw new Error("Not signed in")
			await deleteProject(user.uid, id)
			await refresh()
		},
		[user, refresh]
	)

	const updateProfile = useCallback(
		async (input: { fullName?: string; currency?: string }) => {
			if (!user) throw new Error("Not signed in")
			await upsertProfile({
				userId: user.uid,
				email: user.email ?? undefined,
				...input,
			})
			await refresh()
		},
		[user, refresh]
	)

	const value = useMemo<TracklyContextValue>(
		() => ({
			user,
			profile,
			accounts,
			transactions,
			categories,
			budgets,
			scheduled,
			receipts,
			projects,
			currency,
			loading,
			error,
			stats: buildDashboardStats(accounts, transactions, currency),
			incomeChartData: buildIncomeChartData(transactions, 90),
			expenseTrend: buildExpenseTrendData(transactions),
			categoryMix: buildCategoryMix(transactions),
			signOut: async () => {
				await firebaseSignOut(firebaseAuth)
			},
			refresh,
			addTransaction,
			removeTransaction,
			addAccount,
			deactivateAccount: deactivateAccountFn,
			addBudget,
			removeBudget,
			addScheduled,
			removeScheduled,
			uploadReceipt,
			createExpenseFromReceipt,
			rescanReceipt,
			removeReceipt: removeReceiptFn,
			addCategory,
			addProject,
			removeProject,
			updateProfile,
			isAdmin,
			transactionDraft,
			addTransactionOpen,
			setAddTransactionOpen,
			openAddTransaction,
			addAccountOpen,
			setAddAccountOpen,
		}),
		[
			user,
			profile,
			accounts,
			transactions,
			categories,
			budgets,
			scheduled,
			receipts,
			projects,
			currency,
			loading,
			error,
			refresh,
			addTransaction,
			removeTransaction,
			addAccount,
			deactivateAccountFn,
			addBudget,
			removeBudget,
			addScheduled,
			removeScheduled,
			uploadReceipt,
			createExpenseFromReceipt,
			rescanReceipt,
			removeReceiptFn,
			addCategory,
			addProject,
			removeProject,
			updateProfile,
			isAdmin,
			transactionDraft,
			addTransactionOpen,
			setAddTransactionOpen,
			openAddTransaction,
			addAccountOpen,
		]
	)

	return <TracklyContext.Provider value={value}>{children}</TracklyContext.Provider>
}

export function useTrackly() {
	const context = useContext(TracklyContext)
	if (!context) {
		throw new Error("useTrackly must be used within TracklyProvider")
	}
	return context
}