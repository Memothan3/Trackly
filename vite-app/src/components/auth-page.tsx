"use client"

import { useEffect, useState } from "react"
import type { User } from "firebase/auth"
import { AppleIcon } from "@/components/apple-icon"
import { AuthDivider } from "@/components/auth-divider"
import { AuthLayout } from "@/components/auth-layout"
import { GoogleIcon } from "@/components/google-icon"
import { TracklyBrand } from "@/components/trackly-brand"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group"
import { useTrackly } from "@/contexts/trackly-provider"
import { tracklyConfig } from "@/lib/config"
import {
	clearFirebaseActionParams,
	confirmResetPassword,
	parseFirebaseEmailAction,
	recoverEmailAction,
	verifyEmailAction,
	verifyResetPasswordCode,
} from "@/lib/auth-email-actions"
import {
	completeOAuthProfile,
	completeOAuthSignIn,
	finalizeAuthenticatedUser,
	formatAuthError,
	hasPendingOAuthRedirect,
	isUsernameAvailable,
	requestPasswordReset,
	requiresEmailVerification,
	resendVerificationEmail,
	signInWithApple,
	signInWithGoogle,
	signInWithIdentifier,
	signUpWithEmail,
} from "@/lib/auth-service"
import { firebaseAuth } from "@/lib/firebase"
import { RiAtLine, RiUserLine } from "@remixicon/react"

type AuthView =
	| "signin"
	| "signup"
	| "forgot"
	| "verify-pending"
	| "verify-success"
	| "reset-confirm"
	| "recover-success"
	| "complete-profile"
	| "action-loading"
	| "action-error"

type AuthPageProps = {
	pendingUser?: User | null
	profileSetupUser?: User | null
}

function seedProfileFromUser(user: User) {
	return {
		email: user.email ?? "",
		fullName: user.displayName ?? "",
		username:
			user.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_]/g, "") ?? "",
	}
}

export function AuthPage({
	pendingUser = null,
	profileSetupUser = null,
}: AuthPageProps) {
	const { establishSession, refresh } = useTrackly()
	const [view, setView] = useState<AuthView>(
		pendingUser ? "verify-pending" : "signin"
	)
	const [identifier, setIdentifier] = useState(pendingUser?.email ?? "")
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [fullName, setFullName] = useState("")
	const [username, setUsername] = useState("")
	const [email, setEmail] = useState("")
	const [currency, setCurrency] = useState(tracklyConfig.defaultCurrency)
	const [oauthUser, setOauthUser] = useState<User | null>(null)
	const [resetOobCode, setResetOobCode] = useState<string | null>(null)
	const [recoveredEmail, setRecoveredEmail] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [info, setInfo] = useState<string | null>(null)
	const [submitting, setSubmitting] = useState(false)
	const [resendCooldown, setResendCooldown] = useState(0)
	const [usernameHint, setUsernameHint] = useState<string | null>(null)

	useEffect(() => {
		if (resendCooldown <= 0) return
		const timer = window.setTimeout(() => {
			setResendCooldown((value) => Math.max(0, value - 1))
		}, 1000)
		return () => window.clearTimeout(timer)
	}, [resendCooldown])

	useEffect(() => {
		if (pendingUser?.email) {
			setIdentifier(pendingUser.email)
		}
	}, [pendingUser])

	useEffect(() => {
		if (!profileSetupUser) return
		const seeded = seedProfileFromUser(profileSetupUser)
		setOauthUser(profileSetupUser)
		setEmail(seeded.email)
		setFullName(seeded.fullName)
		setUsername(seeded.username)
		setView("complete-profile")
		setError(null)
	}, [profileSetupUser])

	useEffect(() => {
		if (hasPendingOAuthRedirect()) return

		const action = parseFirebaseEmailAction()
		if (!action) return

		setView("action-loading")
		setError(null)
		setInfo(null)

		void (async () => {
			try {
				switch (action.type) {
					case "verifyEmail": {
						await verifyEmailAction(firebaseAuth, action.oobCode)
						clearFirebaseActionParams()
						const current = firebaseAuth.currentUser
						if (current) {
							await current.reload()
							if (current.emailVerified) {
								await finalizeAuthenticatedUser(current)
								setInfo("Email verified. Welcome to Trackly!")
								setView("verify-success")
								return
							}
						}
						setInfo("Email verified. You can sign in now.")
						setView("signin")
						break
					}
					case "resetPassword": {
						await verifyResetPasswordCode(firebaseAuth, action.oobCode)
						setResetOobCode(action.oobCode)
						setView("reset-confirm")
						break
					}
					case "recoverEmail": {
						const restored = await recoverEmailAction(
							firebaseAuth,
							action.oobCode
						)
						clearFirebaseActionParams()
						setRecoveredEmail(restored ?? null)
						setInfo(`Email restored to ${restored}. Sign in to continue.`)
						setView("recover-success")
						break
					}
				}
			} catch (err) {
				setError(formatAuthError(err))
				setView("action-error")
			}
		})()
	}, [])

	async function handleOAuth(user: User) {
		await establishSession(user)
		const result = await completeOAuthSignIn(user)
		if (result.needsProfile) {
			const seeded = seedProfileFromUser(result.user)
			setOauthUser(result.user)
			setEmail(seeded.email)
			setFullName(seeded.fullName)
			setUsername(seeded.username)
			setView("complete-profile")
			return
		}
		await refresh()
	}

	async function handleGoogle() {
		setSubmitting(true)
		setError(null)
		try {
			const user = await signInWithGoogle()
			if (!user) return
			await handleOAuth(user)
		} catch (err) {
			setError(formatAuthError(err))
		} finally {
			setSubmitting(false)
		}
	}

	async function handleApple() {
		setSubmitting(true)
		setError(null)
		try {
			const user = await signInWithApple()
			if (!user) return
			await handleOAuth(user)
		} catch (err) {
			setError(formatAuthError(err))
		} finally {
			setSubmitting(false)
		}
	}

	async function handleSignIn(event: React.FormEvent) {
		event.preventDefault()
		setSubmitting(true)
		setError(null)
		setInfo(null)
		try {
			const user = await signInWithIdentifier(identifier, password)
			if (requiresEmailVerification(user)) {
				setIdentifier(user.email ?? identifier)
				setInfo("Verify your email before opening the dashboard.")
				setView("verify-pending")
				return
			}
			await establishSession(user)
			await finalizeAuthenticatedUser(user)
			await refresh()
		} catch (err) {
			setError(formatAuthError(err))
		} finally {
			setSubmitting(false)
		}
	}

	async function handleSignUp(event: React.FormEvent) {
		event.preventDefault()
		if (password.length < 6) {
			setError("Password must be at least 6 characters.")
			return
		}
		setSubmitting(true)
		setError(null)
		setInfo(null)
		try {
			const user = await signUpWithEmail({
				fullName,
				username,
				email,
				password,
				currency,
			})
			setIdentifier(user.email ?? email)
			setInfo("Account created. Check your email for the verification link.")
			setView("verify-pending")
		} catch (err) {
			setError(formatAuthError(err))
		} finally {
			setSubmitting(false)
		}
	}

	async function handleForgot(event: React.FormEvent) {
		event.preventDefault()
		setSubmitting(true)
		setError(null)
		setInfo(null)
		try {
			await requestPasswordReset(identifier)
			setInfo("Reset link sent. Check your inbox and spam folder.")
		} catch (err) {
			setError(formatAuthError(err))
		} finally {
			setSubmitting(false)
		}
	}

	async function handleResetConfirm(event: React.FormEvent) {
		event.preventDefault()
		if (!resetOobCode) {
			setError("Reset session expired. Request a new link.")
			return
		}
		if (password.length < 6) {
			setError("Password must be at least 6 characters.")
			return
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match.")
			return
		}
		setSubmitting(true)
		setError(null)
		try {
			await confirmResetPassword(firebaseAuth, resetOobCode, password)
			clearFirebaseActionParams()
			setResetOobCode(null)
			setPassword("")
			setConfirmPassword("")
			setInfo("Password updated. Sign in with your new password.")
			setView("signin")
		} catch (err) {
			setError(formatAuthError(err))
		} finally {
			setSubmitting(false)
		}
	}

	async function handleCompleteProfile(event: React.FormEvent) {
		event.preventDefault()
		if (!oauthUser) {
			setError("OAuth session expired. Try signing in again.")
			setView("signin")
			return
		}
		setSubmitting(true)
		setError(null)
		try {
			await completeOAuthProfile(oauthUser, {
				username,
				fullName,
				currency,
			})
			await establishSession(oauthUser)
			await finalizeAuthenticatedUser(oauthUser)
			setOauthUser(null)
			await refresh()
		} catch (err) {
			setError(formatAuthError(err))
		} finally {
			setSubmitting(false)
		}
	}

	async function handleResendVerification() {
		const user = pendingUser ?? firebaseAuth.currentUser
		if (!user) {
			setError("Sign in again to resend the verification email.")
			return
		}
		setSubmitting(true)
		setError(null)
		try {
			await user.reload()
			if (user.emailVerified) {
				await finalizeAuthenticatedUser(user)
				setInfo("Email already verified. Opening your dashboard…")
				return
			}
			await resendVerificationEmail(user)
			setResendCooldown(60)
			setInfo("Verification email sent again.")
		} catch (err) {
			setError(formatAuthError(err))
		} finally {
			setSubmitting(false)
		}
	}

	function renderHeader(title: string, description: string) {
		return (
			<>
				<TracklyBrand className="mb-1 lg:hidden" />
				<div className="flex flex-col gap-0.5">
					<h1 className="font-bold text-2xl tracking-wide">{title}</h1>
					<p className="text-muted-foreground text-sm">{description}</p>
				</div>
			</>
		)
	}

	function renderMessages() {
		return (
			<>
				{error ? <p className="text-destructive text-sm">{error}</p> : null}
				{info ? <p className="text-primary text-sm">{info}</p> : null}
			</>
		)
	}

	return (
		<AuthLayout>
			{view === "action-loading" ? (
				<>
					{renderHeader("One moment", "Confirming your email request…")}
				</>
			) : null}

			{view === "action-error" ? (
				<>
					{renderHeader("Link problem", "This email link could not be processed.")}
					{renderMessages()}
					<Button className="w-full" onClick={() => setView("signin")} type="button">
						Back to sign in
					</Button>
				</>
			) : null}

			{view === "verify-success" ? (
				<>
					{renderHeader("You're verified", "Your email is confirmed.")}
					{renderMessages()}
					<p className="text-muted-foreground text-sm">
						Opening your dashboard…
					</p>
				</>
			) : null}

			{view === "recover-success" ? (
				<>
					{renderHeader("Email restored", "Your account email was recovered.")}
					{renderMessages()}
					{recoveredEmail ? (
						<p className="text-muted-foreground text-sm">
							Restored address: {recoveredEmail}
						</p>
					) : null}
					<Button className="w-full" onClick={() => setView("signin")} type="button">
						Sign in
					</Button>
				</>
			) : null}

			{view === "verify-pending" ? (
				<>
					{renderHeader(
						"Verify your email",
						"We sent a confirmation link to your inbox."
					)}
					{renderMessages()}
					<p className="text-muted-foreground text-sm">
						Open the link on this device. It returns here to finish verification.
						{identifier ? ` (${identifier})` : ""}
					</p>
					<Button
						className="w-full"
						disabled={submitting || resendCooldown > 0}
						onClick={() => {
							void handleResendVerification()
						}}
						type="button"
						variant="outline"
					>
						{resendCooldown > 0
							? `Resend in ${resendCooldown}s`
							: "Resend verification email"}
					</Button>
					<Button
						className="w-full"
						onClick={() => setView("signin")}
						type="button"
						variant="ghost"
					>
						Back to sign in
					</Button>
				</>
			) : null}

			{view === "reset-confirm" ? (
				<form className="flex flex-col gap-2" onSubmit={handleResetConfirm}>
					{renderHeader(
						"Create new password",
						"Choose a strong password for your account."
					)}
					<Input
						autoComplete="new-password"
						onChange={(e) => setPassword(e.target.value)}
						placeholder="New password"
						required
						type="password"
						value={password}
					/>
					<Input
						autoComplete="new-password"
						onChange={(e) => setConfirmPassword(e.target.value)}
						placeholder="Confirm password"
						required
						type="password"
						value={confirmPassword}
					/>
					{renderMessages()}
					<Button className="w-full" disabled={submitting} type="submit">
						{submitting ? "Saving…" : "Update password"}
					</Button>
					<Button
						className="w-full"
						onClick={() => setView("signin")}
						type="button"
						variant="ghost"
					>
						Back to sign in
					</Button>
				</form>
			) : null}

			{view === "forgot" ? (
				<form className="flex flex-col gap-2" onSubmit={handleForgot}>
					{renderHeader(
						"Reset password",
						"Enter your email or username and we'll send a reset link."
					)}
					<InputGroup>
						<InputGroupInput
							autoComplete="username"
							onChange={(e) => setIdentifier(e.target.value)}
							placeholder="Email or username"
							required
							value={identifier}
						/>
						<InputGroupAddon align="inline-start">
							<RiAtLine />
						</InputGroupAddon>
					</InputGroup>
					{renderMessages()}
					<Button className="w-full" disabled={submitting} type="submit">
						{submitting ? "Sending…" : "Send reset link"}
					</Button>
					<Button
						className="w-full"
						onClick={() => setView("signin")}
						type="button"
						variant="ghost"
					>
						Back to sign in
					</Button>
				</form>
			) : null}

			{view === "complete-profile" ? (
				<form className="flex flex-col gap-2" onSubmit={handleCompleteProfile}>
					{renderHeader(
						"Finish your profile",
						"Pick a username to complete your Trackly account."
					)}
					<Input
						onChange={(e) => setFullName(e.target.value)}
						placeholder="Full name"
						required
						value={fullName}
					/>
					<Input
						onChange={(e) => setUsername(e.target.value.toLowerCase())}
						placeholder="username"
						required
						value={username}
					/>
					<Input
						maxLength={5}
						onChange={(e) => setCurrency(e.target.value.toUpperCase())}
						placeholder="USD"
						value={currency}
					/>
					{email ? (
						<p className="text-muted-foreground text-xs">Signing in as {email}</p>
					) : null}
					{renderMessages()}
					<Button className="w-full" disabled={submitting} type="submit">
						{submitting ? "Saving…" : "Continue to Trackly"}
					</Button>
				</form>
			) : null}

			{view === "signup" ? (
				<form className="flex flex-col gap-2" onSubmit={handleSignUp}>
					{renderHeader(
						"Create account",
						`Join ${tracklyConfig.appName} and sync your finances.`
					)}
					<Input
						onChange={(e) => setFullName(e.target.value)}
						placeholder="Full name"
						required
						value={fullName}
					/>
					<Input
						onChange={(e) => {
							setUsername(e.target.value.toLowerCase())
							setUsernameHint(null)
						}}
						onBlur={() => {
							if (!username) return
							void (async () => {
								const result = await isUsernameAvailable(username)
								setUsernameHint(
									result.available
										? "Username is available."
										: (result.message ?? "Username is not available.")
								)
							})()
						}}
						placeholder="username"
						required
						value={username}
					/>
					{usernameHint ? (
						<p
							className={
								usernameHint.endsWith("available.")
									? "text-primary text-xs"
									: "text-destructive text-xs"
							}
						>
							{usernameHint}
						</p>
					) : null}
					<Input
						autoComplete="email"
						onChange={(e) => setEmail(e.target.value)}
						placeholder="you@example.com"
						required
						type="email"
						value={email}
					/>
					<Input
						autoComplete="new-password"
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Password (min 6 characters)"
						required
						type="password"
						value={password}
					/>
					<Input
						maxLength={5}
						onChange={(e) => setCurrency(e.target.value.toUpperCase())}
						placeholder="USD"
						value={currency}
					/>
					{renderMessages()}
					<Button className="w-full" disabled={submitting} type="submit">
						{submitting ? "Creating…" : "Create account"}
					</Button>
					<Button
						className="w-full"
						onClick={() => {
							setView("signin")
							setError(null)
							setInfo(null)
						}}
						type="button"
						variant="ghost"
					>
						Already have an account? Sign in
					</Button>
				</form>
			) : null}

			{view === "signin" ? (
				<>
					{renderHeader(
						"Welcome back",
						`Sign in to ${tracklyConfig.appName} with Google or your email.`
					)}

					<div className="flex flex-col gap-2">
						<Button
							className="w-full"
							disabled={submitting}
							onClick={() => {
								void handleGoogle()
							}}
							type="button"
						>
							<GoogleIcon data-icon="inline-start" />
							Continue with Google
						</Button>
						<Button
							className="w-full"
							disabled={submitting}
							onClick={() => {
								void handleApple()
							}}
							type="button"
							variant="outline"
						>
							<AppleIcon data-icon="inline-start" />
							Continue with Apple
						</Button>
					</div>

					<AuthDivider>or sign in with email</AuthDivider>

					<form className="flex flex-col gap-2" onSubmit={handleSignIn}>
						<InputGroup>
							<InputGroupInput
								autoComplete="username"
								onChange={(e) => setIdentifier(e.target.value)}
								placeholder="Email or username"
								required
								value={identifier}
							/>
							<InputGroupAddon align="inline-start">
								<RiUserLine />
							</InputGroupAddon>
						</InputGroup>
						<Input
							autoComplete="current-password"
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Password"
							required
							type="password"
							value={password}
						/>
						<div className="flex justify-end">
							<button
								className="text-primary text-xs underline-offset-4 hover:underline"
								onClick={() => {
									setView("forgot")
									setError(null)
									setInfo(null)
								}}
								type="button"
							>
								Forgot password?
							</button>
						</div>
						{renderMessages()}
						<Button className="w-full" disabled={submitting} type="submit">
							{submitting ? "Signing in…" : "Sign in"}
						</Button>
					</form>

					<Button
						className="w-full"
						onClick={() => {
							setView("signup")
							setError(null)
							setInfo(null)
						}}
						type="button"
						variant="ghost"
					>
						Create an account
					</Button>
				</>
			) : null}
		</AuthLayout>
	)
}