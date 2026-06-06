/**
 * Regenerates logo PNGs from brand/logo.jpg and brand/icon.jpg.
 */
import path from "node:path"
import { fileURLToPath } from "node:url"
import { spawnSync } from "node:child_process"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const script = path.join(root, "scripts", "sync-brand-assets.py")

const run = spawnSync("python", [script], { cwd: root, stdio: "inherit", shell: true })
if (run.status !== 0) process.exit(run.status ?? 1)