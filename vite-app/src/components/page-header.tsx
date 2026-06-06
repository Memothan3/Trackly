import type { ReactNode } from "react"

type PageHeaderProps = {
	title: string
	description?: string
	action?: ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
	return (
		<div className="flex flex-wrap items-start justify-between gap-3">
			<div className="min-w-0">
				<h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
				{description ? (
					<p className="text-muted-foreground text-sm">{description}</p>
				) : null}
			</div>
			{action ? (
				<div className="hidden shrink-0 min-[901px]:block">{action}</div>
			) : null}
		</div>
	)
}