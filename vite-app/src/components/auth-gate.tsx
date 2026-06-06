"use client"

import { AuthPage } from "@/components/auth-page"
import { isAdminEmail } from "@/lib/auth-config"
import { useTrackly } from "@/contexts/trackly-provider"

export function AuthGate() {
	const { user, profile } = useTrackly()
	const pendingVerification =
		user && !user.emailVerified && !isAdminEmail(user.email)
	const needsProfile = Boolean(user && !profile && !pendingVerification)

	return (
		<AuthPage
			pendingUser={pendingVerification ? user : null}
			profileSetupUser={needsProfile ? user : null}
		/>
	)
}