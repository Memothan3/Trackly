#!/usr/bin/env node
/**
 * Apply pending Supabase migrations via Management API.
 * Requires SUPABASE_ACCESS_TOKEN (personal access token from dashboard).
 *
 * Usage:
 *   $env:SUPABASE_ACCESS_TOKEN="sbp_..." ; node scripts/run-supabase-migration.mjs
 */

import { readFileSync, readdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const projectRef = "kkokfrkfffxlousawivj"
const token = process.env.SUPABASE_ACCESS_TOKEN?.trim()

if (!token) {
	console.error(
		"Missing SUPABASE_ACCESS_TOKEN.\n" +
			"Create one at https://supabase.com/dashboard/account/tokens then run:\n" +
			'  $env:SUPABASE_ACCESS_TOKEN="sbp_..." ; node scripts/run-supabase-migration.mjs'
	)
	process.exit(1)
}

const migrationsDir = join(root, "supabase", "migrations")
const files = readdirSync(migrationsDir)
	.filter((name) => name.endsWith(".sql"))
	.sort()

if (!files.length) {
	console.error("No migration files found.")
	process.exit(1)
}

async function runQuery(query) {
	const response = await fetch(
		`https://api.supabase.com/v1/projects/${projectRef}/database/query`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ query }),
		}
	)

	const text = await response.text()
	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${text}`)
	}

	try {
		return JSON.parse(text)
	} catch {
		return text
	}
}

async function verify() {
	const response = await fetch(
		`https://kkokfrkfffxlousawivj.supabase.co/rest/v1/rpc/resolve_login_email`,
		{
			method: "POST",
			headers: {
				apikey: "sb_publishable_ci4FPaMp4BhuoTMftaTgBQ_H00cny3I",
				Authorization: "Bearer sb_publishable_ci4FPaMp4BhuoTMftaTgBQ_H00cny3I",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ login_identifier: "__migration_check__" }),
		}
	)

	return response.status !== 404
}

console.log(`Applying ${files.length} migration(s) to ${projectRef}...`)

for (const file of files) {
	const sql = readFileSync(join(migrationsDir, file), "utf8")
	console.log(`→ ${file}`)
	await runQuery(sql)
	console.log(`  ✓ applied`)
}

const ok = await verify()
if (ok) {
	console.log("✓ resolve_login_email RPC is live.")
} else {
	console.warn("⚠ Migration ran but RPC verification failed — check Supabase logs.")
}