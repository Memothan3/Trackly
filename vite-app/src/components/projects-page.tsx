import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { TransactionList } from "@/components/transaction-list"
import {
	buildProjectSummary,
	filterProjectTransactions,
} from "@/lib/project-metrics"
import { useTrackly } from "@/contexts/trackly-provider"
import { cn } from "@/lib/utils"
import type { TracklyProject } from "@/types/trackly"
import { ArrowLeftIcon, FolderIcon } from "lucide-react"

export function ProjectsPage() {
	const {
		projects,
		transactions,
		currency,
		addProject,
		removeProject,
		openAddTransaction,
		removeTransaction,
	} = useTrackly()
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [name, setName] = useState("")
	const [description, setDescription] = useState("")
	const [budget, setBudget] = useState("")
	const [submitting, setSubmitting] = useState(false)
	const [formError, setFormError] = useState<string | null>(null)

	const selected = useMemo(
		() => projects.find((p) => p.id === selectedId) ?? null,
		[projects, selectedId]
	)

	const summaries = useMemo(
		() =>
			projects.map((p) => ({
				project: p,
				summary: buildProjectSummary(p, transactions, currency),
			})),
		[projects, transactions, currency]
	)

	async function handleAdd(event: React.FormEvent) {
		event.preventDefault()
		if (!name.trim()) {
			setFormError("Project name is required.")
			return
		}
		setSubmitting(true)
		setFormError(null)
		try {
			await addProject({
				name: name.trim(),
				description: description.trim(),
				budget: Number.parseFloat(budget) || 0,
			})
			setName("")
			setDescription("")
			setBudget("")
		} catch (err) {
			setFormError(err instanceof Error ? err.message : "Could not create project")
		} finally {
			setSubmitting(false)
		}
	}

	if (selected) {
		return (
			<ProjectDetail
				currency={currency}
				onAddTransaction={() => openAddTransaction({ projectId: selected.id })}
				onBack={() => setSelectedId(null)}
				onDeleteTransaction={(id) => {
					void removeTransaction(id)
				}}
				project={selected}
				transactions={transactions}
			/>
		)
	}

	return (
		<div className="flex flex-col gap-4">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">Projects</h1>
				<p className="text-muted-foreground text-sm">
					Track trips, renovations, or ventures with their own budget and
					transactions.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>New project</CardTitle>
				</CardHeader>
				<CardContent>
					<form className="flex flex-col gap-3" onSubmit={handleAdd}>
						<Input
							onChange={(e) => setName(e.target.value)}
							placeholder="Project name"
							value={name}
						/>
						<Input
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Description"
							value={description}
						/>
						<Input
							min="0"
							onChange={(e) => setBudget(e.target.value)}
							placeholder="Budget (optional)"
							step="0.01"
							type="number"
							value={budget}
						/>
						{formError ? (
							<p className="text-destructive text-sm">{formError}</p>
						) : null}
						<Button disabled={submitting} type="submit">
							{submitting ? "Creating…" : "Create project"}
						</Button>
					</form>
				</CardContent>
			</Card>

			{!summaries.length ? (
				<p className="text-muted-foreground text-sm">No projects yet.</p>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{summaries.map(({ project, summary }) => (
						<Card
							className="cursor-pointer transition-colors hover:border-primary/40"
							key={project.id}
							onClick={() => setSelectedId(project.id)}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									setSelectedId(project.id)
								}
							}}
						>
							<CardHeader>
								<div className="flex items-start gap-3">
									<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
										<FolderIcon className="size-5" />
									</div>
									<div className="min-w-0 flex-1">
										<CardTitle className="text-base">{project.name}</CardTitle>
										{project.description ? (
											<CardDescription className="line-clamp-2">
												{project.description}
											</CardDescription>
										) : null}
									</div>
								</div>
							</CardHeader>
							<CardContent className="flex flex-col gap-3">
								<div className="flex flex-wrap gap-3 text-sm">
									<span className="text-muted-foreground">
										Budget {summary.budgetLabel}
									</span>
									<span className="text-muted-foreground">
										Spent {summary.expenseLabel}
									</span>
									<span
										className={cn(
											"font-medium",
											summary.balance >= 0
												? "text-primary"
												: "text-destructive"
										)}
									>
										Balance {summary.balanceLabel}
									</span>
								</div>
								{summary.budget > 0 ? (
									<div className="h-2 overflow-hidden rounded-full bg-muted">
										<div
											className={cn(
												"h-full rounded-full",
												summary.budgetUsedPercent > 100
													? "bg-destructive"
													: summary.budgetUsedPercent > 80
														? "bg-primary/80"
														: "bg-primary"
											)}
											style={{
												width: `${summary.budgetUsedPercent}%`,
											}}
										/>
									</div>
								) : null}
								<div className="flex justify-end gap-2">
									<Button
										onClick={(e) => {
											e.stopPropagation()
											if (confirm("Delete this project?")) {
												void removeProject(project.id)
											}
										}}
										size="sm"
										type="button"
										variant="ghost"
									>
										Delete
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	)
}

function ProjectDetail({
	project,
	transactions,
	currency,
	onBack,
	onAddTransaction,
	onDeleteTransaction,
}: {
	project: TracklyProject
	transactions: ReturnType<typeof useTrackly>["transactions"]
	currency: string
	onBack: () => void
	onAddTransaction: () => void
	onDeleteTransaction: (id: string) => void
}) {
	const summary = buildProjectSummary(project, transactions, currency)
	const projectTxns = filterProjectTransactions(project.id, transactions)

	return (
		<div className="flex flex-col gap-4">
			<Button
				className="w-fit"
				onClick={onBack}
				size="sm"
				type="button"
				variant="outline"
			>
				<ArrowLeftIcon className="size-4" />
				Back to projects
			</Button>

			<div>
				<h1 className="font-semibold text-2xl tracking-tight">{project.name}</h1>
				{summary.description ? (
					<p className="text-muted-foreground text-sm">{summary.description}</p>
				) : null}
			</div>

			<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
				<StatCard label="Budget" value={summary.budgetLabel} />
				<StatCard label="Income" value={summary.incomeLabel} variant="income" />
				<StatCard label="Expenses" value={summary.expenseLabel} variant="expense" />
				<StatCard
					label="Balance"
					value={summary.balanceLabel}
					variant={summary.balance >= 0 ? "income" : "expense"}
				/>
			</div>

			<div className="flex justify-end">
				<Button onClick={onAddTransaction} type="button">
					Add transaction
				</Button>
			</div>

			<TransactionList
				currency={currency}
				emptyDescription="Add income or expenses tagged to this project."
				emptyTitle="No project transactions"
				onDelete={onDeleteTransaction}
				transactions={projectTxns}
			/>
		</div>
	)
}

function StatCard({
	label,
	value,
	variant,
}: {
	label: string
	value: string
	variant?: "income" | "expense"
}) {
	return (
		<div className="rounded-xl border border-border/60 bg-card/80 p-4">
			<p className="text-muted-foreground text-xs uppercase tracking-wide">
				{label}
			</p>
			<p
				className={cn(
					"mt-1 font-semibold text-lg tabular-nums tracking-tight",
					variant === "income" && "text-primary",
					variant === "expense" && "text-destructive"
				)}
			>
				{value}
			</p>
		</div>
	)
}