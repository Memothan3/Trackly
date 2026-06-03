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

/** Vite dev paths — never serve legacy files for these */
function isViteInternalRequest(url: string) {
	return (
		url.startsWith("/@") ||
		url.startsWith("/src/") ||
		url.startsWith("/node_modules/") ||
		url.startsWith("/assets/") ||
		url.startsWith("/app") ||
		url === "/vite.svg"
	)
}

function serveFile(res: ServerResponse, filePath: string) {
	const ext = path.extname(filePath).toLowerCase()
	res.statusCode = 200
	res.setHeader("Content-Type", MIME[ext] ?? "application/octet-stream")
	fs.createReadStream(filePath).pipe(res)
}

function serveLegacyFile(
	req: IncomingMessage,
	res: ServerResponse,
	tracklyRoot: string
) {
	if (!req.url || req.method !== "GET") {
		return false
	}

	const pathname = decodeURIComponent(req.url.split("?")[0] ?? "/")

	if (isViteInternalRequest(pathname)) {
		return false
	}

	// Classic HTML dashboard → React app (unless ?classic=1 on the target URL)
	if (
		pathname === "/trackly_dashboard.html" &&
		!req.url?.includes("classic=1")
	) {
		const pageMatch = req.url?.match(/[?&]page=([^&]+)/)
		const page = pageMatch ? decodeURIComponent(pageMatch[1]) : ""
		let target = "/app/"
		if (page && page !== "dashboard") {
			target += `#/${page}`
		}
		res.statusCode = 302
		res.setHeader("Location", target)
		res.end()
		return true
	}

	// Marketing landing at site root (parent index.html, not vite-app/index.html)
	if (pathname === "/" || pathname === "/index.html") {
		const marketingIndex = path.join(tracklyRoot, "index.html")
		if (fs.existsSync(marketingIndex)) {
			serveFile(res, marketingIndex)
			return true
		}
	}

	const relativePath = pathname.replace(/^\//, "")
	const filePath = path.resolve(tracklyRoot, relativePath)
	if (!filePath.startsWith(tracklyRoot)) {
		return false
	}

	if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
		return false
	}

	serveFile(res, filePath)
	return true
}

export function legacyTracklyPlugin(tracklyRoot: string): Plugin {
	return {
		name: "legacy-trackly",
		configureServer(server) {
			// Run before Vite's SPA handler so `/` serves the marketing site
			server.middlewares.use((req, res, next) => {
				if (serveLegacyFile(req, res, tracklyRoot)) {
					return
				}
				next()
			})
		},
	}
}