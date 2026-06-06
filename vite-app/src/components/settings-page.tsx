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
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTrackly } from "@/contexts/trackly-provider"
import { dedupeCategories } from "@/lib/categories"
import { GEMINI_KEY_STORAGE } from "@/lib/gemini"
import { legacyAuthUrl } from "@/lib/legacy-links"
import { appRouteHref } from "@/hooks/use-app-route"

export function SettingsPage() {
	const { profile, user, categories, updateProfile, signOut, addCategory } =
		useTrackly()
	const [fullName, setFullName] = useState(profile?.full_name ?? "")
	const [currency, setCurrency] = useState(profile?.currency ?? "USD")
	const [geminiKey, setGeminiKey] = useState("")
	const [categoryName, setCategoryName] = useState("")
	const [categoryType, setCategoryType] = useState<"income" | "expense">(
		"expense"
	)
	const [saving, setSaving] = useState(false)
	const [categorySaving, setCategorySaving] = useState(false)
	const [message, setMessage] = useState<string | null>(null)

	const uniqueCategories = useMemo(() => dedupeCategories(categories), [categories])
	const customCategories = useMemo(
		() => uniqueCategories.filter((c) => !c.is_default),
		[uniqueCategories]
	)

	useEffect(() => {
		setFullName(profile?.full_name ?? "")
		setCurrency(profile?.currency ?? "USD")
		setGeminiKey(localStorage.getItem(GEMINI_KEY_STORAGE) ?? "")
	}, [profile])

	async function handleAddCategory(event: React.FormEvent) {
		event.preventDefault()
		if (!categoryName.trim()) return
		setCategorySaving(true)
		setMessage(null)
		try {
			await addCategory({
				name: categoryName.trim(),
				type: categoryType,
			})
			setCategoryName("")
			setMessage("Category added.")
		} catch (err) {
			setMessage(err instanceof Error ? err.message : "Could not add category")
		} finally {
			setCategorySaving(false)
		}
	}

	async function saveProfile(event: React.FormEvent) {
		event.preventDefault()
		setSaving(true)
		setMessage(null)
		try {
			await updateProfile({
				fullName: fullName.trim(),
				currency: currency.trim().toUpperCase(),
			})
			localStorage.setItem(GEMINI_KEY_STORAGE, geminiKey.trim())
			setMessage("Settings saved.")
		} catch (err) {
			setMessage(err instanceof Error ? err.message : "Save failed")
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className="flex max-w-xl flex-col gap-4">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">Settings</h1>
				<p className="text-muted-foreground text-sm">
					Profile, currency, and AI keys for receipt extraction and chat.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Profile</CardTitle>
					<CardDescription>{user?.email}</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="flex flex-col gap-3" onSubmit={saveProfile}>
						<div className="flex flex-col gap-1">
							<span className="font-medium text-sm">Display name</span>
							<Input
								onChange={(e) => setFullName(e.target.value)}
								value={fullName}
							/>
						</div>
						<div className="flex flex-col gap-1">
							<span className="font-medium text-sm">Default currency</span>
							<Input
								maxLength={5}
								onChange={(e) => setCurrency(e.target.value.toUpperCase())}
								value={currency}
							/>
						</div>
						<div className="flex flex-col gap-1">
							<span className="font-medium text-sm">Gemini API key</span>
							<Input
								onChange={(e) => setGeminiKey(e.target.value)}
								placeholder="For receipts and AI assistant"
								type="password"
								value={geminiKey}
							/>
						</div>
						{message ? (
							<p className="text-muted-foreground text-sm">{message}</p>
						) : null}
						<Button disabled={saving} type="submit">
							{saving ? "Saving…" : "Save settings"}
						</Button>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Categories</CardTitle>
					<CardDescription>
						Add custom income or expense categories for transactions and budgets.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<form
						className="flex flex-col gap-2 sm:flex-row"
						onSubmit={handleAddCategory}
					>
						<Input
							onChange={(e) => setCategoryName(e.target.value)}
							placeholder="Category name"
							value={categoryName}
						/>
						<Select
							onValueChange={(v) =>
								setCategoryType(v as "income" | "expense")
							}
							value={categoryType}
						>
							<SelectTrigger className="sm:w-[140px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="expense">Expense</SelectItem>
								<SelectItem value="income">Income</SelectItem>
							</SelectContent>
						</Select>
						<Button disabled={categorySaving} type="submit">
							{categorySaving ? "Adding…" : "Add"}
						</Button>
					</form>
					<div className="flex flex-wrap gap-2">
						{uniqueCategories.map((c) => (
							<Badge key={c.id} variant={c.is_default ? "outline" : "secondary"}>
								{c.name}
								{c.is_default ? " (default)" : ""}
							</Badge>
						))}
					</div>
					{customCategories.length === 0 ? (
						<p className="text-muted-foreground text-xs">
							No custom categories yet — defaults are always available.
						</p>
					) : null}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Data & account</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-2">
					<Button asChild variant="outline">
						<a href={appRouteHref("export")}>Export data</a>
					</Button>
					<Button onClick={() => void signOut()} variant="outline">
						Sign out
					</Button>
					<Button asChild variant="ghost">
						<a href={legacyAuthUrl()}>Switch account</a>
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}