import { createPortal } from "react-dom"

/**
 * Animated ambient background — portaled to <body> so it sits behind the app.
 */
export function DashboardBackground() {
	const canvas = (
		<div aria-hidden className="trackly-bg-canvas">
			<div className="trackly-bg-mesh" />
			<div className="trackly-bg-orbs">
				<div className="trackly-bg-orb trackly-bg-orb--1" />
				<div className="trackly-bg-orb trackly-bg-orb--2" />
				<div className="trackly-bg-orb trackly-bg-orb--3" />
			</div>
			<div className="trackly-bg-grid" />
			<div className="trackly-bg-aurora" />
			<div className="trackly-bg-aurora trackly-bg-aurora--slow" />
			<div className="trackly-bg-grain" />
			<div className="trackly-bg-vignette" />
		</div>
	)

	if (typeof document === "undefined") {
		return null
	}

	return createPortal(canvas, document.body)
}