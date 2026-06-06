"use client"

import { AuthPage } from "@/components/auth-page"
import { hasAppAccess } from "@/lib/auth-config"
import { useTrackly } from "@/contexts/trackly-provider"

export function AuthGate() {
	const { user, profile } = useTrackly()
	const pendingVerification = Boolean(user && !hasAppAccess(user))
	const needsProfile = Boolean(user && !profile && !pendingVerification)

	return (
		<AuthPage
			pendingUser={pendingVerification ? user : null}
			profileSetupUser={needsProfile ? user : null}
		/>
	)
}