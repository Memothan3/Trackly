import fs from "node:fs"
import path from "node:path"
import type { IncomingMessage, ServerResponse } from "node:http"
import type { Plugin } from "vite"

const MIME: Record<string, string> = {
	".html": "text/html; charset=utf-8",
	".js": "application/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
	".webp": "image/webp",
	".woff2": "font/woff2",
}

function shouldSkipLegacyRequest(url: string) {
	return (
		url.startsWith("/@") ||
		url.startsWith("/src/") ||
		url.startsWith("/node_modules/") ||
		url.startsWith("/assets/") ||
		url === "/" ||
		url === "/index.html"
	)
}

function serveLegacyFile(
	req: IncomingMessage,
	res: ServerResponse,
	tracklyRoot: string
) {
	if (!req.url || req.method !== "GET") {
		return false
	}

	const pathname = decodeURIComponent(req.url.split("?")[0] ?? "")
	if (shouldSkipLegacyRequest(pathname)) {
		return false
	}

	const relativePath = pathname.replace(/^\//, "")
	const filePath = path.resolve(tracklyRoot, relativePath)
	if (!filePath.startsWith(tracklyRoot)) {
		return false
	}

	if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
		return false
	}

	const ext = path.extname(filePath).toLowerCase()
	res.statusCode = 200
	res.setHeader("Content-Type", MIME[ext] ?? "application/octet-stream")
	fs.createReadStream(filePath).pipe(res)
	return true
}

export function legacyTracklyPlugin(tracklyRoot: string): Plugin {
	return {
		name: "legacy-trackly",
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				if (serveLegacyFile(req, res, tracklyRoot)) {
					return
				}
				next()
			})
		},
	}
}
