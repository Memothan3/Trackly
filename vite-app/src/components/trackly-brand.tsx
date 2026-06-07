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
	return (
		<img
			alt="Trackly"
			className={cn(
				showName
					? "h-12 w-auto max-w-[240px] object-contain object-left"
					: "h-10 w-auto max-w-[200px] shrink-0 object-contain object-left",
				iconClassName,
				className
			)}
			decoding="async"
			src={brandAssets.full}
		/>
	)
}