#!/usr/bin/env node
/**
 * Netrooo — start every Trackly dev server.
 * Usage: npm run netrooo   (or: .\netrooo.cmd / .\netrooo.ps1)
 */
import { spawn, spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const servers = [
	{
		name: "MAIN",
		label: "Trackly (landing + auth + dashboard)",
		cwd: "vite-app",
		port: 5173,
		urls: [
			"http://localhost:5173/",
			"http://localhost:5173/auth_fixed.html",
			"http://localhost:5173/app/",
		],
		command: "npm",
		args: ["run", "dev"],
	},
	{
		name: "UI",
		label: "Trackly UI (embed / components)",
		cwd: "trackly-ui",
		port: 5174,
		urls: ["http://localhost:5174/"],
		command: "npm",
		args: ["run", "dev", "--", "--port", "5174", "--host"],
	},
]

function ensureDeps(dir) {
	const nm = path.join(root, dir, "node_modules")
	if (!fs.existsSync(nm)) {
		console.log(`\n📦 Installing ${dir} dependencies…`)
		spawnSync("npm", ["install"], {
			cwd: path.join(root, dir),
			shell: true,
			stdio: "inherit",
		})
	}
}

function ensureRootDeps() {
	if (!fs.existsSync(path.join(root, "node_modules", "concurrently"))) {
		console.log("\n📦 Installing root dependencies (concurrently)…")
		spawnSync("npm", ["install"], { cwd: root, shell: true, stdio: "inherit" })
	}
}

function banner() {
	console.log(`
\x1b[38;5;208m╔══════════════════════════════════════╗
║            N E T R O O O             ║
║         Trackly servers up           ║
╚══════════════════════════════════════╝\x1b[0m
`)
	for (const s of servers) {
		console.log(`  \x1b[1m${s.label}\x1b[0m`)
		for (const url of s.urls) {
			console.log(`    → ${url}`)
		}
		console.log("")
	}
	console.log("  Press Ctrl+C to stop all servers.\n")
}

ensureRootDeps()
for (const s of servers) {
	ensureDeps(s.cwd)
}

banner()

const proc = spawn("npm", ["run", "netrooo:raw"], {
	cwd: root,
	shell: true,
	stdio: "inherit",
	env: { ...process.env, FORCE_COLOR: "1" },
})

proc.on("exit", (code) => {
	process.exit(code ?? 0)
})

process.on("SIGINT", () => {
	proc.kill("SIGINT")
})
process.on("SIGTERM", () => {
	proc.kill("SIGTERM")
})