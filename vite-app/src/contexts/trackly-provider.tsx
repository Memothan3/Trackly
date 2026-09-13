"use client"

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react"
import {
	onIdTokenChanged,
	signOut as firebaseSignOut,
	type User,
} from "firebase/auth"
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

		let transactions = transactionsResult.data as TracklyTransaction[] | null
		if (transactionsResult.error) {
			console.warn(
				"Transactions with categories failed, trying fallback:",
				transactionsResult.error.message
			)
			const fallback = await supabase
				.from("transactions")
				.select("*")
				.eq("user_id", userId)
				.order("date", { ascending: false })
				.limit(500)
			transactions = fallback.data as TracklyTransaction[] | null
		}

		let profile = profileResult.data as TracklyProfile | null
		if (profileResult.error) {
			console.warn("Profile loading failed:", profileResult.error.message)
			profile = null
		}

		let accounts = accountsResult.data as TracklyAccount[] | null
		if (accountsResult.error) {
			console.warn("Accounts loading failed:", accountsResult.error.message)
			accounts = []
		}

		return {
			profile: profile ?? null,
			accounts: accounts ?? [],
			transactions: transactions ?? [],
		}
	} catch (error) {
		console.error("Critical error loading Trackly data:", error)
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
	// Firebase can mutate the current User in place (e.g. after reload()/email
	// verification). Bump this so context consumers re-render on token changes.
	const [authTick, setAuthTick] = useState(0)
	const loadedUidRef = useRef<string | null>(null)
	const hydratingRef = useRef(false)

	const hydrateUser = useCallback(async (firebaseUser: User) => {
		if (hydratingRef.current && loadedUidRef.current === firebaseUser.uid) {
			return
		}

		hydratingRef.current = true
		loadedUidRef.current = firebaseUser.uid
		setUser(firebaseUser)
		setLoading(true)
		setError(null)

		try {
			const idToken = await firebaseUser.getIdToken(true)

			try {
				const { error: supabaseError } = await supabase.auth.setSession({
					access_token: idToken,
					refresh_token: idToken,
				})

				if (supabaseError) {
					console.warn(
						"Supabase session sync failed, continuing with Firebase auth:",
						supabaseError.message
					)
				}
			} catch (supabaseErr) {
				console.warn(
					"Supabase auth error, continuing with Firebase auth:",
					supabaseErr
				)
			}

			const data = await loadTracklyData(firebaseUser.uid)
			setProfile(data.profile)
			setAccounts(data.accounts)
			setTransactions(data.transactions)
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to initialize Trackly"
			setError(errorMessage)
			console.error("Auth initialization error:", err)
		} finally {
			hydratingRef.current = false
			setLoading(false)
		}
	}, [])

	const refresh = useCallback(async () => {
		if (!user) {
			return
		}
		setError(null)
		try {
			const idToken = await user.getIdToken(true)

			try {
				await supabase.auth.setSession({
					access_token: idToken,
					refresh_token: idToken,
				})
			} catch (supabaseErr) {
				console.warn("Failed to refresh Supabase session:", supabaseErr)
			}

			const data = await loadTracklyData(user.uid)
			setProfile(data.profile)
			setAccounts(data.accounts)
			setTransactions(data.transactions)
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to refresh Trackly data"
			)
			console.error("Refresh error:", err)
		}
	}, [user])

	useEffect(() => {
		let active = true
		let unsubscribe: (() => void) | undefined

		const clearSession = () => {
			if (!active) return
			loadedUidRef.current = null
			hydratingRef.current = false
			setUser(null)
			setProfile(null)
			setAccounts([])
			setTransactions([])
			setLoading(false)
			void supabase.auth.signOut()
		}

		const bootstrap = async () => {
			try {
				// Wait for Firebase to restore any persisted session before treating
				// the user as signed out — avoids flashing AuthGate on refresh.
				await firebaseAuth.authStateReady()
				if (!active) return

				unsubscribe = onIdTokenChanged(firebaseAuth, (firebaseUser) => {
					if (!active) return

					if (!firebaseUser) {
						clearSession()
						return
					}

					if (
						hydratingRef.current &&
						loadedUidRef.current === firebaseUser.uid
					) {
						return
					}

					if (loadedUidRef.current !== firebaseUser.uid) {
						void hydrateUser(firebaseUser)
						return
					}

					setUser(firebaseUser)
					setAuthTick((tick) => tick + 1)
				})

				const sessionUser = firebaseAuth.currentUser
				if (!sessionUser) {
					setLoading(false)
					return
				}

				await hydrateUser(sessionUser)
			} catch (err) {
				if (!active) return
				setError(err instanceof Error ? err.message : "Authentication failed")
				setLoading(false)
			}
		}

		void bootstrap()

		return () => {
			active = false
			unsubscribe?.()
		}
	}, [hydrateUser])

	const currency = (profile?.currency ?? tracklyConfig.defaultCurrency).toUpperCase()

	const value = useMemo<TracklyContextValue>(() => {
		void authTick
		return {
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
					await firebaseSignOut(firebaseAuth)
					await supabase.auth.signOut()
				} catch (err) {
					console.error("Sign out error:", err)
					throw err
				}
			},
			refresh,
		}
	}, [
		user,
		authTick,
		profile,
		accounts,
		transactions,
		currency,
		loading,
		error,
		refresh,
	])

	return <TracklyContext.Provider value={value}>{children}</TracklyContext.Provider>
}

export function useTrackly() {
	const context = useContext(TracklyContext)
	if (!context) {
		throw new Error("useTrackly must be used within TracklyProvider")
	}
	return context
}
