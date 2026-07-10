"use client"

import { useState } from "react"
import {
	GoogleAuthProvider,
	signInWithEmailAndPassword,
	signInWithPopup,
} from "firebase/auth"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { tracklyConfig } from "@/lib/config"
import { firebaseAuth } from "@/lib/firebase"
import { legacyAuthUrl } from "@/lib/legacy-links"

export function AuthGate() {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState<string | null>(null)
	const [submitting, setSubmitting] = useState(false)

	async function handleEmailSignIn(event: React.FormEvent) {
		event.preventDefault()
		setSubmitting(true)
		setError(null)
		try {
			await signInWithEmailAndPassword(firebaseAuth, email.trim(), password)
		} catch (err) {
			setError(err instanceof Error ? err.message : "Sign in failed")
		} finally {
			setSubmitting(false)
		}
	}

	async function handleGoogleSignIn() {
		setSubmitting(true)
		setError(null)
		try {
			await signInWithPopup(firebaseAuth, new GoogleAuthProvider())
		} catch (err) {
			setError(err instanceof Error ? err.message : "Google sign in failed")
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="flex min-h-svh items-center justify-center p-6">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>{tracklyConfig.appName}</CardTitle>
					<CardDescription>
						Sign in to view your finance dashboard.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<form className="flex flex-col gap-3" onSubmit={handleEmailSignIn}>
						<Input
							autoComplete="email"
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Email"
							required
							type="email"
							value={email}
						/>
						<Input
							autoComplete="current-password"
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Password"
							required
							type="password"
							value={password}
						/>
						<Button disabled={submitting} type="submit">
							Sign in
						</Button>
					</form>
					<Button
						disabled={submitting}
						onClick={() => {
							void handleGoogleSignIn()
						}}
						type="button"
						variant="outline"
					>
						Continue with Google
					</Button>
					{error ? (
						<p className="text-destructive text-sm">{error}</p>
					) : null}
					<p className="text-muted-foreground text-xs">
						Or use the{" "}
						<a
							className="underline underline-offset-4"
							href={legacyAuthUrl()}
						>
							classic sign-in page
						</a>
						.
					</p>
				</CardContent>
			</Card>
		</div>
	)
}
