import { useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { useTrackly } from "@/contexts/trackly-provider"
import { askGemini, getGeminiApiKey } from "@/lib/gemini"
import { formatMoney } from "@/lib/trackly-metrics"
import { appRouteHref } from "@/hooks/use-app-route"
import { PaperclipIcon, XIcon } from "lucide-react"

type ChatMessage = { role: "user" | "assistant"; text: string }

type PendingAttachment = {
	name: string
	dataUrl?: string
	textSnippet?: string
}

export function AiPage() {
	const { stats, currency, transactions, budgets } = useTrackly()
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [input, setInput] = useState("")
	const [attachment, setAttachment] = useState<PendingAttachment | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const fileRef = useRef<HTMLInputElement>(null)

	const context = useMemo(() => {
		const recent = transactions.slice(0, 15).map((t) => ({
			type: t.type,
			amount: t.amount,
			reason: t.reason,
			date: t.date,
		}))
		return `You are Trackly finance assistant. User currency: ${currency}. Stats: ${JSON.stringify(stats)}. Active budgets: ${budgets.length}. Recent transactions: ${JSON.stringify(recent)}. Be concise and practical.`
	}, [stats, currency, transactions, budgets])

	async function handleFile(file: File) {
		if (file.size > 2 * 1024 * 1024) {
			setError("Attachment must be under 2MB.")
			return
		}
		if (file.type.startsWith("image/")) {
			const dataUrl = await new Promise<string>((resolve, reject) => {
				const reader = new FileReader()
				reader.onload = () => resolve(String(reader.result))
				reader.onerror = () => reject(new Error("Could not read image"))
				reader.readAsDataURL(file)
			})
			setAttachment({ name: file.name, dataUrl })
			setError(null)
			return
		}
		if (
			file.type.startsWith("text/") ||
			file.name.endsWith(".csv") ||
			file.name.endsWith(".json")
		) {
			const text = await file.text()
			setAttachment({
				name: file.name,
				textSnippet: text.slice(0, 4000),
			})
			setError(null)
			return
		}
		setError("Use an image, CSV, JSON, or text file.")
	}

	async function send() {
		const text = input.trim()
		if (!text && !attachment) return
		if (!getGeminiApiKey()) {
			setError("Add your Gemini API key in Settings first.")
			return
		}

		const userLabel = attachment
			? `${text || "Analyze attachment"} [${attachment.name}]`
			: text

		setInput("")
		setError(null)
		setMessages((m) => [...m, { role: "user", text: userLabel }])
		setLoading(true)

		const prompt = [
			text,
			attachment?.textSnippet
				? `Attached file (${attachment.name}):\n${attachment.textSnippet}`
				: "",
		]
			.filter(Boolean)
			.join("\n\n")

		const imageUrl = attachment?.dataUrl
		const currentAttachment = attachment
		setAttachment(null)

		try {
			const reply = await askGemini(
				prompt || "What can you tell me about this attachment?",
				context,
				imageUrl
			)
			setMessages((m) => [
				...m,
				{ role: "assistant", text: reply || "No response." },
			])
		} catch (err) {
			setError(err instanceof Error ? err.message : "AI request failed")
			if (currentAttachment) {
				setAttachment(currentAttachment)
			}
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="flex flex-col gap-4">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">AI Assistant</h1>
				<p className="text-muted-foreground text-sm">
					Ask about spending, budgets, and trends. Attach images or text files for
					context.
				</p>
			</div>

			{!getGeminiApiKey() ? (
				<Card>
					<CardContent className="pt-6 text-sm">
						<p className="text-muted-foreground">
							Add a Gemini API key in{" "}
							<a className="text-primary underline" href={appRouteHref("settings")}>
								Settings
							</a>{" "}
							to enable the assistant.
						</p>
					</CardContent>
				</Card>
			) : null}

			<Card className="flex min-h-[420px] flex-col">
				<CardHeader>
					<CardTitle>Chat</CardTitle>
					<CardDescription>
						Balance snapshot: {stats[0]?.value ?? formatMoney(0, currency)}
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-1 flex-col gap-3">
					<div className="flex max-h-[50vh] min-h-[200px] flex-1 flex-col gap-3 overflow-y-auto rounded-lg border border-border/60 bg-muted/30 p-3">
						{!messages.length ? (
							<p className="text-muted-foreground text-sm">
								Try: &quot;Where did I spend the most this month?&quot; or attach
								a receipt image.
							</p>
						) : (
							messages.map((msg, i) => (
								<div
									className={
										msg.role === "user"
											? "ms-auto max-w-[85%] rounded-lg bg-primary px-3 py-2 text-primary-foreground text-sm"
											: "max-w-[85%] rounded-lg border border-border bg-card px-3 py-2 text-sm"
									}
									key={`${msg.role}-${i}`}
								>
									{msg.text}
								</div>
							))
						)}
						{loading ? (
							<p className="text-muted-foreground text-sm">Thinking…</p>
						) : null}
					</div>
					{attachment ? (
						<div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm">
							<span className="min-w-0 flex-1 truncate">{attachment.name}</span>
							<Button
								aria-label="Remove attachment"
								onClick={() => setAttachment(null)}
								size="icon"
								type="button"
								variant="ghost"
							>
								<XIcon className="size-4" />
							</Button>
						</div>
					) : null}
					{error ? <p className="text-destructive text-sm">{error}</p> : null}
					<div className="flex flex-col gap-2 sm:flex-row">
						<input
							accept="image/*,.txt,.csv,.json,text/plain"
							className="hidden"
							onChange={(e) => {
								const file = e.target.files?.[0]
								if (file) void handleFile(file)
								e.target.value = ""
							}}
							ref={fileRef}
							type="file"
						/>
						<Button
							aria-label="Attach file"
							disabled={loading}
							onClick={() => fileRef.current?.click()}
							size="icon"
							type="button"
							variant="outline"
						>
							<PaperclipIcon className="size-4" />
						</Button>
						<textarea
							className="min-h-[44px] flex-1 resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault()
									void send()
								}
							}}
							placeholder="Ask Trackly AI…"
							value={input}
						/>
						<Button disabled={loading} onClick={() => void send()} type="button">
							Send
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}