export type TracklyProfile = {
	id: string
	full_name?: string | null
	currency?: string | null
	username?: string | null
}

export type TracklyCategory = {
	id: string
	name: string
	type?: string | null
	user_id?: string | null
	is_default?: boolean | null
}

export type TracklyBudget = {
	id: string
	user_id: string
	category_id?: string | null
	limit_amount?: number | null
	amount?: number | null
	period?: string | null
	is_active: boolean
	categories?: { name: string } | null
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
	project_id?: string | null
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

export type TracklyScheduled = {
	id: string
	user_id: string
	type: string
	amount: number
	frequency: string
	next_date: string
	reason?: string | null
	is_active: boolean
	accounts?: { name: string } | null
	categories?: { name: string } | null
}

export type TracklyReceipt = {
	id: string
	user_id: string
	transaction_id?: string | null
	type?: string | null
	image_url?: string | null
	extracted_data?: Record<string, unknown> | null
	ai_processed?: boolean | null
	created_at: string
}

export type TracklyProject = {
	id: string
	user_id: string
	name: string
	description?: string | null
	budget?: number | null
	created_at: string
}
