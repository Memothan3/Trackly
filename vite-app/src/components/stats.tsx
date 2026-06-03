import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Delta, DeltaIcon, DeltaValue } from "@/components/delta";
import type { DashboardStat } from "@/types/trackly";

export function DashboardStats({ stats }: { stats: DashboardStat[] }) {
	return (
		<>
			{stats.map((s) => (
				<StatCard key={s.label} stat={s} />
			))}
		</>
	);
}

function StatCard({ stat }: { stat: DashboardStat }) {
	const { label, value, delta, hint } = stat;
	return (
		<Card>
			<CardHeader>
				<CardTitle className="font-normal text-muted-foreground text-xs">
					{label}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-balance font-semibold text-2xl tabular-nums tracking-tight">
					{value}
				</p>
			</CardContent>
			<CardFooter className="gap-1.5 text-xs">
				{delta !== 0 ? (
					<Delta value={delta} variant="default">
						<DeltaIcon />
						<DeltaValue />
					</Delta>
				) : null}
				<span className="text-pretty text-muted-foreground">{hint}</span>
			</CardFooter>
		</Card>
	);
}
