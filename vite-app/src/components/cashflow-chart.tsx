"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart"
import type { WeeklyCashflowRow } from "@/lib/cashflow-metrics"

const chartConfig = {
	inflow: { label: "Inflow", color: "var(--chart-1)" },
	outflow: { label: "Outflow", color: "var(--chart-2)" },
} satisfies ChartConfig

export function CashflowChart({ data }: { data: WeeklyCashflowRow[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Weekly cashflow</CardTitle>
				<CardDescription>Inflow vs outflow for the current month</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer className="aspect-auto h-56 w-full" config={chartConfig}>
					<BarChart accessibilityLayer data={[...data]} margin={{ left: 8, right: 8 }}>
						<CartesianGrid vertical={false} strokeDasharray="2 2" />
						<XAxis axisLine={false} dataKey="week" tickLine={false} tickMargin={8} />
						<ChartTooltip content={<ChartTooltipContent />} />
						<ChartLegend content={<ChartLegendContent />} />
						<Bar dataKey="inflow" fill="var(--color-inflow)" radius={4} />
						<Bar dataKey="outflow" fill="var(--color-outflow)" radius={4} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}