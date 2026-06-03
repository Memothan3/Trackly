"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
	const { theme, setTheme } = useTheme()
	const isDark =
		theme === "dark" ||
		(theme === "system" &&
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches)

	return (
		<Button
			aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
			onClick={() => setTheme(isDark ? "light" : "dark")}
			size="icon"
			variant="ghost"
		>
			{isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
		</Button>
	)
}