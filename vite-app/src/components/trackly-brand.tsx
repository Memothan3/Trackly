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
	const imgClass = cn(
		showName
			? "h-12 w-auto max-w-[240px] object-contain object-left"
			: "h-10 w-auto max-w-[200px] shrink-0 object-contain object-left",
		iconClassName,
		className
	)

	return (
		<span className="inline-flex items-center leading-none">
			<img
				alt="Trackly"
				className={cn(imgClass, "hidden dark:block")}
				decoding="async"
				src={brandAssets.full}
			/>
			<img
				alt="Trackly"
				className={cn(imgClass, "block dark:hidden")}
				decoding="async"
				src={brandAssets.fullOnLight}
			/>
		</span>
	)
}