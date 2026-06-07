import type React from "react"
import { brandAssets } from "@/lib/brand-assets"
import { cn } from "@/lib/utils"

export function LogoIcon({
	className,
	...props
}: React.ComponentProps<"img">) {
	return (
		<img
			alt="Trackly"
			className={cn(
				"h-10 w-auto max-w-[200px] shrink-0 object-contain object-left",
				className
			)}
			decoding="async"
			src={brandAssets.full}
			{...props}
		/>
	)
}

export function Logo({ className, ...props }: React.ComponentProps<"img">) {
	return (
		<img
			alt="Trackly"
			className={cn("h-11 w-auto max-w-[220px] object-contain object-left", className)}
			decoding="async"
			src={brandAssets.full}
			{...props}
		/>
	)
}