import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTrackly } from "@/contexts/trackly-provider"
import { listAdminProfiles } from "@/lib/trackly-api"
import { classicDashboardUrl } from "@/lib/legacy-links"

type AdminProfile = {
	id: string
	full_name?: string | null
	username?: string | null
	currency?: string | null
	created_at?: string | null
}

export function AdminPage() {
	const { isAdmin, user } = useTrackly()
	const [profiles, setProfiles] = useState<AdminProfile[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!isAdmin) return
		let cancelled = false
		void (async () => {
			setLoading(true)
			setError(null)
			try {
				const rows = await listAdminProfiles()
				if (!cancelled) {
					setProfiles(rows as AdminProfile[])
				}
			} catch (err) {
				if (!cancelled) {
					setError(
						err instanceof Error ? err.message : "Could not load profiles"
					)
				}
			} finally {
				if (!cancelled) setLoading(false)
			}
		})()
		return () => {
			cancelled = true
		}
	}, [isAdmin])

	if (!isAdmin) {
		return (
			<Card>
				<CardContent className="pt-6">
					<p className="text-muted-foreground text-sm">
						Admin access is restricted. Signed in as {user?.email}.
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h1 className="font-semibold text-2xl tracking-tight">Admin</h1>
					<p className="text-muted-foreground text-sm">
						User directory from Supabase. Full admin tools remain on the classic
						dashboard.
					</p>
				</div>
				<Badge variant="destructive">Admin mode</Badge>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Classic admin tools</CardTitle>
					<CardDescription>
						Edit users, export all data, and bulk operations
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button asChild variant="outline">
						<a href={classicDashboardUrl()}>Open classic dashboard</a>
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Users</CardTitle>
					<CardDescription>
						{loading
							? "Loading profiles…"
							: `${profiles.length} profile(s) visible`}
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-2">
					{error ? (
						<p className="text-destructive text-sm">{error}</p>
					) : null}
					{!loading && !profiles.length && !error ? (
						<p className="text-muted-foreground text-sm">
							No profiles returned. Check Supabase RLS for admin read access.
						</p>
					) : null}
					{profiles.map((p) => (
						<div
							className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 py-2 last:border-0"
							key={p.id}
						>
							<div>
								<p className="font-medium text-sm">
									{p.full_name || p.username || "Unnamed user"}
								</p>
								<p className="text-muted-foreground text-xs">{p.id}</p>
							</div>
							<span className="text-muted-foreground text-xs">
								{p.currency ?? "USD"}
							</span>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	)
}