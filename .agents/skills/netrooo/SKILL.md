---
name: netrooo
description: Start all Trackly dev servers. Use when the user says "Netrooo", "netrooo", "start all servers", "boot trackly", or wants the full local dev stack running.
user-invocable: true
---

# Netrooo

Starts every Trackly dev server in one command.

## Run (required)

From the repo root `trackly/`:

```bash
npm run netrooo
```

Windows alternatives:

```powershell
.\netrooo.ps1
```

```cmd
netrooo.cmd
```

Run in the **background** and keep it running. Do not tell the user to run it themselves unless they prefer to.

## URLs after startup

| Service | URL |
|---------|-----|
| Landing | http://localhost:5173/ |
| Auth | http://localhost:5173/auth_fixed.html |
| Dashboard (React) | http://localhost:5173/app/ |
| Trackly UI | http://localhost:5174/ |

## Notes

- First run may `npm install` in root, `vite-app`, and `trackly-ui` if `node_modules` is missing.
- Ctrl+C in the Netrooo terminal stops all servers.
- If a port is busy, stop the old process or change ports in `scripts/netrooo.mjs`.