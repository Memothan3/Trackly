import {
	applyActionCode,
	checkActionCode,
	confirmPasswordReset,
	verifyPasswordResetCode,
	type Auth,
} from "firebase/auth"

export type FirebaseEmailAction =
	| { type: "verifyEmail"; oobCode: string }
	| { type: "resetPassword"; oobCode: string }
	| { type: "recoverEmail"; oobCode: string }

export function parseFirebaseEmailAction(): FirebaseEmailAction | null {
	const search = new URLSearchParams(window.location.search)
	let mode = search.get("mode")
	let oobCode = search.get("oobCode")

	if (!mode || !oobCode) {
		const hashQuery = window.location.hash.split("?")[1]
		if (hashQuery) {
			const hashParams = new URLSearchParams(hashQuery)
			mode = mode || hashParams.get("mode")
			oobCode = oobCode || hashParams.get("oobCode")
		}
	}

	if (!mode || !oobCode) return null

	switch (mode) {
		case "verifyEmail":
			return { type: "verifyEmail", oobCode }
		case "resetPassword":
			return { type: "resetPassword", oobCode }
		case "recoverEmail":
			return { type: "recoverEmail", oobCode }
		default:
			return null
	}
}

export function clearFirebaseActionParams() {
	const { origin, pathname, hash } = window.location
	const cleanedHash = hash.split("?")[0] || ""
	window.history.replaceState({}, document.title, `${origin}${pathname}${cleanedHash}`)
}

export async function verifyEmailAction(auth: Auth, oobCode: string) {
	await applyActionCode(auth, oobCode)
}

export async function verifyResetPasswordCode(auth: Auth, oobCode: string) {
	await verifyPasswordResetCode(auth, oobCode)
}

export async function confirmResetPassword(
	auth: Auth,
	oobCode: string,
	newPassword: string
) {
	await confirmPasswordReset(auth, oobCode, newPassword)
}

export async function recoverEmailAction(auth: Auth, oobCode: string) {
	const info = await checkActionCode(auth, oobCode)
	const restoredEmail = info.data.email
	await applyActionCode(auth, oobCode)
	return restoredEmail
}