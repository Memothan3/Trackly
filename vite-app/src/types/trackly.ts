export type TracklyProfile = {
	id: string
	full_name?: string | null
	currency?: string | null
	username?: string | null
}

export type TracklyAccount = {
	id: string
	user_id: string
	name: string
	type: string
	currency: string
	balance: number
	is_active: boolean
}

export type TracklyTransaction = {
	id: string
	user_id: string
	account_id: string
	category_id?: string | null
	type: "income" | "expense" | "transfer"
	amount: number
	currency?: string | null
	date: string
	reason?: string | null
	note?: string | null
	categories?: { name: string } | null
}

export type DashboardStat = {
	label: string
	value: string
	delta: number
	hint: string
}

export type IncomeChartRow = {
	date: string
	revenue: number
}

export type ExpenseTrendRow = {
	day: string
	returnRate: number
}

export type CategoryMixDatum = {
	category: string
	share: number
}
