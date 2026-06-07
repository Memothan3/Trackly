import type React from "react"
import { brandAssets } from "@/lib/brand-assets"
import { cn } from "@/lib/utils"

type LogoImageProps = Omit<React.ComponentProps<"img">, "src" | "alt">

function WordmarkPair({
	className,
	...props
}: LogoImageProps) {
	const imgClass = cn("object-contain object-left", className)

	return (
		<span className="inline-flex items-center leading-none">
			<img
				alt="Trackly"
				className={cn(imgClass, "hidden dark:block")}
				decoding="async"
				src={brandAssets.full}
				{...props}
			/>
			<img
				alt=""
				aria-hidden
				className={cn(imgClass, "block dark:hidden")}
				decoding="async"
				src={brandAssets.fullOnLight}
			/>
		</span>
	)
}

export function LogoIcon({
	className,
	...props
}: LogoImageProps) {
	return (
		<WordmarkPair
			className={cn(
				"h-10 w-auto max-w-[200px] shrink-0",
				className
			)}
			{...props}
		/>
	)
}

export function Logo({ className, ...props }: LogoImageProps) {
	return (
		<WordmarkPair
			className={cn("h-11 w-auto max-w-[220px]", className)}
			{...props}
		/>
	)
}