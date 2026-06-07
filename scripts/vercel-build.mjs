/**
 * Assembles a single Vercel output: marketing/auth HTML at /, React app at /app/
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { spawnSync } from "node:child_process"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const viteApp = path.join(root, "vite-app")
const out = path.join(root, "output")

const staticRootFiles = new Set([
	"index.html",
	"manifest.json",
	"config.js",
	"trackly-brand.js",
	"trackly-brand.css",
	"trackly-landing.css",
	"logo-icon.png",
	"logo-full2.png",
	"service-worker.js",
])

const staticDirs = ["legacy"]

const staticExtensions = new Set([
	".html",
	".css",
	".js",
	".json",
	".png",
	".jpg",
	".jpeg",
	".svg",
	".ico",
	".webp",
	".woff2",
	".txt",
])

function rm(dir) {
	if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true })
}

function mkdirp(dir) {
	fs.mkdirSync(dir, { recursive: true })
}

function copyFile(src, dest) {
	mkdirp(path.dirname(dest))
	fs.copyFileSync(src, dest)
}

function copyDir(src, dest) {
	mkdirp(dest)
	for (const name of fs.readdirSync(src)) {
		const s = path.join(src, name)
		const d = path.join(dest, name)
		if (fs.statSync(s).isDirectory()) copyDir(s, d)
		else copyFile(s, d)
	}
}

console.log("→ Installing vite-app dependencies…")
const install = spawnSync("npm", ["ci"], {
	cwd: viteApp,
	stdio: "inherit",
	shell: true,
})
if (install.status !== 0) {
	console.warn("npm ci failed, trying npm install…")
	const fallback = spawnSync("npm", ["install"], {
		cwd: viteApp,
		stdio: "inherit",
		shell: true,
	})
	if (fallback.status !== 0) process.exit(1)
}

console.log("→ Building Vite app…")
const build = spawnSync("npm", ["run", "build"], {
	cwd: viteApp,
	stdio: "inherit",
	shell: true,
})
if (build.status !== 0) process.exit(build.status ?? 1)

const viteDist = path.join(viteApp, "dist")
if (!fs.existsSync(path.join(viteDist, "index.html"))) {
	console.error("vite-app/dist/index.html missing after build")
	process.exit(1)
}

console.log("→ Assembling output/ …")
rm(out)
mkdirp(out)

for (const file of staticRootFiles) {
	const src = path.join(root, file)
	if (fs.existsSync(src)) copyFile(src, path.join(out, file))
}

for (const dir of staticDirs) {
	const src = path.join(root, dir)
	if (fs.existsSync(src)) copyDir(src, path.join(out, dir))
}

for (const name of fs.readdirSync(root)) {
	if (
		name.startsWith(".") ||
		name === "vite-app" ||
		name === "trackly-ui" ||
		name === "output" ||
		name === "legacy" ||
		name === "docs"
	) {
		continue
	}
	const src = path.join(root, name)
	if (!fs.statSync(src).isFile()) continue
	const ext = path.extname(name).toLowerCase()
	if (!staticExtensions.has(ext)) continue
	copyFile(src, path.join(out, name))
}

copyDir(viteDist, path.join(out, "app"))
console.log("✓ output/ ready (static site + /app/ dashboard)")