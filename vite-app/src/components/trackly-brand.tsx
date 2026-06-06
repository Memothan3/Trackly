import { LogoIcon } from "@/components/logo"
import { tracklyConfig } from "@/lib/config"
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
		<div className={cn("flex items-center gap-2 text-foreground", className)}>
			<LogoIcon className={cn("size-8 shrink-0 text-primary", iconClassName)} />
			{showName ? (
				<span className="font-semibold text-lg tracking-tight">
					{tracklyConfig.appName}
				</span>
			) : null}
		</div>
	)
}