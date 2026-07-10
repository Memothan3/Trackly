"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Delta, DeltaIcon, DeltaValue } from "@/components/delta";
import { formatMoney } from "@/lib/trackly-metrics";
import type { ExpenseTrendRow } from "@/types/trackly";
import { tracklyDashboardUrl } from "@/lib/legacy-links";
import { ArrowRightIcon } from "lucide-react";

const chartConfig = {
	returnRate: {
		label: "Expenses",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

export function RefundReturnRateChart({
	rows,
	dailyAverage,
	currency,
}: {
	rows: ExpenseTrendRow[];
	dailyAverage: number;
	currency: string;
}) {
	const first = rows[0];
	const last = rows.at(-1) ?? first;
	const expenseTrendPct =
		first && first.returnRate > 0
			? (((last?.returnRate ?? 0) - first.returnRate) / first.returnRate) * 100
			: 0;

	return (
		<Card className="md:col-span-2">
			<CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<CardTitle>Daily expenses</CardTitle>
					<CardDescription>Last 7 days</CardDescription>
				</div>
				<div className="space-y-1">
					<CardTitle className="text-right">
						{formatMoney(dailyAverage, currency)}
					</CardTitle>
					<CardDescription>daily average</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="mt-auto">
				<ChartContainer
					className="aspect-auto h-56 w-full"
					config={chartConfig}
				>
					<LineChart
						accessibilityLayer
						data={rows}
						margin={{ left: 12, right: 12, top: 12, bottom: 0 }}
					>
						<CartesianGrid horizontal={false} strokeDasharray="3 3" />
						<XAxis
							axisLine={false}
							dataKey="day"
							interval={1}
							minTickGap={8}
							tickLine={false}
							tickMargin={8}
						/>
						<ChartTooltip content={<ChartTooltipContent indicator="line" />} />
						<Line
							dataKey="returnRate"
							dot={false}
							stroke="var(--color-returnRate)"
							strokeWidth={2.5}
							type="monotone"
						/>
					</LineChart>
				</ChartContainer>
			</CardContent>
			<CardFooter>
				<div className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-muted-foreground text-xs">
					<Delta value={expenseTrendPct}>
						<DeltaIcon />
						<DeltaValue />
					</Delta>
					<span className="inline-flex min-w-0 text-pretty">
						vs first day (last 7 days)
					</span>
				</div>
				<Button
					asChild
					className="text-muted-foreground"
					size="xs"
					variant="ghost"
				>
					<a href={tracklyDashboardUrl("budgets")}>
						View budgets
						<ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
					</a>
				</Button>
			</CardFooter>
		</Card>
	);
}
