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
				"h-7 w-auto max-w-[120px] shrink-0 object-contain object-left",
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
			className={cn("h-8 w-auto max-w-[160px] object-contain object-left", className)}
			decoding="async"
			src={brandAssets.full}
			{...props}
		/>
	)
}