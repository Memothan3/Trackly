import type { ReactNode } from "react"
import { TracklyBrand } from "@/components/trackly-brand"
import { FloatingPaths } from "@/components/floating-paths"
import { Button } from "@/components/ui/button"
import { getLegacyOrigin } from "@/lib/legacy-links"
import { RiArrowLeftSLine } from "@remixicon/react"

export function AuthLayout({ children }: { children: ReactNode }) {
	const homeUrl = `${getLegacyOrigin()}/`

	return (
		<main className="relative md:min-h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
			<div className="trackly-glass relative hidden h-full min-h-screen flex-col border-r border-white/10 p-10 lg:flex">
				<div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
				<TracklyBrand className="relative z-10 mr-auto" />

				<div className="relative z-10 mt-auto">
					<blockquote className="flex flex-col gap-2">
						<p className="text-xl">
							&ldquo;Trackly keeps my spending visible and my budgets honest —
							everything in one calm dashboard.&rdquo;
						</p>
						<footer className="font-mono font-semibold text-sm text-muted-foreground">
							Trackly member
						</footer>
					</blockquote>
				</div>
				<div className="absolute inset-0">
					<FloatingPaths position={1} />
					<FloatingPaths position={-1} />
				</div>
			</div>

			<div className="relative flex min-h-screen flex-col justify-center px-6 py-10 sm:px-8">
				<div
					aria-hidden
					className="absolute inset-0 isolate -z-10 opacity-60 contain-strict"
				>
					<div className="absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)]" />
					<div className="absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] [translate:5%_-50%]" />
					<div className="absolute top-0 right-0 h-320 w-60 -translate-y-87.5 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)]" />
				</div>

				<Button asChild className="absolute top-7 left-5" variant="ghost">
					<a href={homeUrl}>
						<RiArrowLeftSLine data-icon="inline-start" />
						Home
					</a>
				</Button>

				<div className="trackly-glass mx-auto flex w-full max-w-sm flex-col gap-4 rounded-3xl p-6 sm:max-w-md sm:p-8">
					{children}
				</div>
			</div>
		</main>
	)
}