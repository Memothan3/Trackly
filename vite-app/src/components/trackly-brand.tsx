import { brandAssets } from "@/lib/brand-assets"
import { cn } from "@/lib/utils"

export function TracklyBrand({
	className,
	iconClassName,
	showName = true,
}: {
	className?: string
	iconClassName?: string
	showName?: boolean
}) {
	if (showName) {
		return (
			<img
				alt="Trackly"
				className={cn(
					"h-9 w-auto max-w-[180px] object-contain object-left",
					className
				)}
				decoding="async"
				src={brandAssets.full}
			/>
		)
	}

	return (
		<img
			alt=""
			aria-hidden
			className={cn("size-8 shrink-0 object-contain", iconClassName, className)}
			decoding="async"
			src={brandAssets.icon}
		/>
	)
}