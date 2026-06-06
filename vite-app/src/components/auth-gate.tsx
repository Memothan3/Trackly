"use client"

import { AuthPage } from "@/components/auth-page"
import { isAdminEmail } from "@/lib/auth-config"
import { useTrackly } from "@/contexts/trackly-provider"

export function AuthGate() {
	const { user } = useTrackly()
	const pendingVerification =
		user && !user.emailVerified && !isAdminEmail(user.email)

	return <AuthPage pendingUser={pendingVerification ? user : null} />
}