const GEMINI_MODELS = [
	"gemini-2.0-flash",
	"gemini-1.5-flash",
]

export const GEMINI_KEY_STORAGE = "trackly-gemini-key"

export function getGeminiApiKey() {
	return (localStorage.getItem(GEMINI_KEY_STORAGE) ?? "").trim()
}

export type ReceiptExtraction = {
	merchant?: string | null
	date?: string | null
	total?: number | null
	currency?: string | null
	category_suggestion?: string | null
	confidence?: string | null
}

export async function extractReceiptFromImage(
	base64DataUrl: string
): Promise<ReceiptExtraction | null> {
	const apiKey = getGeminiApiKey()
	if (!apiKey) {
		throw new Error("Add your Gemini API key in Settings first.")
	}

	const match = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/)
	if (!match) {
		throw new Error("Invalid image data.")
	}

	const mimeType = match[1]
	const base64 = match[2]

	const prompt = `Analyze this receipt image and extract JSON only:
{
  "merchant": "store name or null",
  "date": "YYYY-MM-DD or null",
  "total": number or null,
  "currency": "USD",
  "category_suggestion": "Purchase, Utility, Transport, Food, or Other",
  "confidence": "high, medium, or low"
}`

	const payload = {
		contents: [
			{
				role: "user",
				parts: [
					{ inline_data: { mime_type: mimeType, data: base64 } },
					{ text: prompt },
				],
			},
		],
	}

	for (const model of GEMINI_MODELS) {
		try {
			const res = await fetch(
				`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				}
			)
			if (!res.ok) continue
			const json = (await res.json()) as {
				candidates?: { content?: { parts?: { text?: string }[] } }[]
			}
			const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
			const cleaned = text.replace(/```json|```/g, "").trim()
			return JSON.parse(cleaned) as ReceiptExtraction
		} catch {
			continue
		}
	}

	return null
}

export async function askGemini(
	prompt: string,
	context?: string,
	imageDataUrl?: string
) {
	const apiKey = getGeminiApiKey()
	if (!apiKey) {
		throw new Error("Add your Gemini API key in Settings first.")
	}

	const fullPrompt = context
		? `${context}\n\nUser question: ${prompt}`
		: prompt

	const parts: Array<
		| { text: string }
		| { inline_data: { mime_type: string; data: string } }
	> = [{ text: fullPrompt }]

	if (imageDataUrl) {
		const match = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/)
		if (match) {
			parts.unshift({
				inline_data: { mime_type: match[1], data: match[2] },
			})
		}
	}

	for (const model of GEMINI_MODELS) {
		try {
			const res = await fetch(
				`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						contents: [{ role: "user", parts }],
					}),
				}
			)
			if (!res.ok) continue
			const json = (await res.json()) as {
				candidates?: { content?: { parts?: { text?: string }[] } }[]
			}
			return json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ""
		} catch {
			continue
		}
	}

	throw new Error("Could not reach Gemini. Check your API key.")
}