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
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from "firebase/auth"
import { tracklyConfig } from "@/lib/config"
import { firebaseAuth } from "@/lib/firebase"
import { supabase } from "@/lib/supabase"
import {
	buildCategoryMix,
	buildDashboardStats,
	buildExpenseTrendData,
	buildIncomeChartData,
} from "@/lib/trackly-metrics"
import type {
	TracklyAccount,
	TracklyProfile,
	TracklyTransaction,
} from "@/types/trackly"

type TracklyContextValue = {
	user: User | null
	profile: TracklyProfile | null
	accounts: TracklyAccount[]
	transactions: TracklyTransaction[]
	currency: string
	loading: boolean
	error: string | null
	stats: ReturnType<typeof buildDashboardStats>
	incomeChartData: ReturnType<typeof buildIncomeChartData>
	expenseTrend: ReturnType<typeof buildExpenseTrendData>
	categoryMix: ReturnType<typeof buildCategoryMix>
	signOut: () => Promise<void>
	refresh: () => Promise<void>
}

const TracklyContext = createContext<TracklyContextValue | null>(null)

async function loadTracklyData(userId: string) {
	try {
		const [profileResult, accountsResult, transactionsResult] = await Promise.all([
			supabase.from("profiles").select("*").eq("id", userId).single(),
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
		])

		// Handle transactions with category join failure
		let transactions = transactionsResult.data as TracklyTransaction[] | null
		if (transactionsResult.error) {
			console.warn('Transactions with categories failed, trying fallback:', transactionsResult.error.message)
			const fallback = await supabase
				.from("transactions")
				.select("*")
				.eq("user_id", userId)
				.order("date", { ascending: false })
				.limit(500)
			transactions = fallback.data as TracklyTransaction[] | null
		}

		// Handle profile loading failure
		let profile = profileResult.data as TracklyProfile | null
		if (profileResult.error) {
			console.warn('Profile loading failed:', profileResult.error.message)
			profile = null
		}

		// Handle accounts loading failure
		let accounts = accountsResult.data as TracklyAccount[] | null
		if (accountsResult.error) {
			console.warn('Accounts loading failed:', accountsResult.error.message)
			accounts = []
		}

		return {
			profile: profile ?? null,
			accounts: accounts ?? [],
			transactions: transactions ?? [],
		}
	} catch (error) {
		console.error('Critical error loading Trackly data:', error)
		// Return empty state on critical errors
		return {
			profile: null,
			accounts: [],
			transactions: [],
		}
	}
}

export function TracklyProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [profile, setProfile] = useState<TracklyProfile | null>(null)
	const [accounts, setAccounts] = useState<TracklyAccount[]>([])
	const [transactions, setTransactions] = useState<TracklyTransaction[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const refresh = useCallback(async () => {
		if (!user) {
			return
		}
		setError(null)
		try {
			// Refresh Firebase token
			const idToken = await user.getIdToken(true)
			
			// Update Supabase session if possible
			try {
				await supabase.auth.setSession({
					access_token: idToken,
					refresh_token: idToken,
				})
			} catch (supabaseErr) {
				console.warn('Failed to refresh Supabase session:', supabaseErr)
			}
			
			// Reload data
			const data = await loadTracklyData(user.uid)
			setProfile(data.profile)
			setAccounts(data.accounts)
			setTransactions(data.transactions)
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to refresh Trackly data")
			console.error('Refresh error:', err)
		}
	}, [user])

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
			if (!firebaseUser) {
				setUser(null)
				setProfile(null)
				setAccounts([])
				setTransactions([])
				setLoading(false)
				// Clear Supabase session on Firebase logout
				void supabase.auth.signOut()
				return
			}

			setUser(firebaseUser)
			setLoading(true)
			setError(null)

			try {
				// Get Firebase ID token
				const idToken = await firebaseUser.getIdToken(true)
				
				// Try to sync with Supabase using Firebase token as custom auth
				try {
					const { error: supabaseError } = await supabase.auth.setSession({
						access_token: idToken,
						refresh_token: idToken,
					})
					
					if (supabaseError) {
						console.warn('Supabase session sync failed, continuing with Firebase auth:', supabaseError.message)
						// Continue anyway - user is authenticated with Firebase
					}
				} catch (supabaseErr) {
					console.warn('Supabase auth error, continuing with Firebase auth:', supabaseErr)
					// Continue anyway - user is authenticated with Firebase
				}
				
				// Load Trackly data with fallback
				const data = await loadTracklyData(firebaseUser.uid)
				setProfile(data.profile)
				setAccounts(data.accounts)
				setTransactions(data.transactions)
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : "Failed to initialize Trackly"
				setError(errorMessage)
				console.error('Auth initialization error:', err)
				// Set user even if data loading fails - they're still authenticated
			} finally {
				setLoading(false)
			}
		})

		return unsubscribe
	}, [])

	const currency = (profile?.currency ?? tracklyConfig.defaultCurrency).toUpperCase()

	const value = useMemo<TracklyContextValue>(
		() => ({
			user,
			profile,
			accounts,
			transactions,
			currency,
			loading,
			error,
			stats: buildDashboardStats(accounts, transactions, currency),
			incomeChartData: buildIncomeChartData(transactions, 90),
			expenseTrend: buildExpenseTrendData(transactions),
			categoryMix: buildCategoryMix(transactions),
			signOut: async () => {
				try {
					// Sign out from Firebase
					await firebaseSignOut(firebaseAuth)
					// Clear Supabase session
					await supabase.auth.signOut()
				} catch (err) {
					console.error('Sign out error:', err)
					throw err
				}
			},
			refresh,
		}),
		[
			user,
			profile,
			accounts,
			transactions,
			currency,
			loading,
			error,
			refresh,
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
