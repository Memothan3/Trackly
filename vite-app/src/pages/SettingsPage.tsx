"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useTrackly } from "@/contexts/trackly-provider";

export function SettingsPage() {
	const { user, profile, currency, signOut } = useTrackly();
	const name =
		profile?.full_name ?? user?.displayName ?? user?.email?.split("@")[0] ?? "User";

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
				<p className="text-muted-foreground text-sm">
					Profile and account preferences for your Trackly session.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Profile</CardTitle>
					<CardDescription>
						Signed-in identity from Firebase. Editing moves to a later pass.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-3 text-sm">
					<div className="flex items-center justify-between gap-4">
						<span className="text-muted-foreground">Name</span>
						<span className="font-medium">{name}</span>
					</div>
					<div className="flex items-center justify-between gap-4">
						<span className="text-muted-foreground">Email</span>
						<span className="font-medium">{user?.email ?? "—"}</span>
					</div>
					<div className="flex items-center justify-between gap-4">
						<span className="text-muted-foreground">Currency</span>
						<span className="font-medium">{currency}</span>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Session</CardTitle>
					<CardDescription>Sign out of Firebase and clear local session state.</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						onClick={() => {
							void signOut();
						}}
						variant="destructive"
					>
						Log out
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
