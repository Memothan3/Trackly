import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { legacyTracklyPlugin } from "./legacy-trackly-plugin"

const tracklyRoot = path.resolve(__dirname, "..")

// https://vite.dev/config/
export default defineConfig({
  base: "/app/",
  plugins: [react(), tailwindcss(), legacyTracklyPlugin(tracklyRoot)],
  server: {
    open: "/app/",
    // base: '/app/' makes the default HMR socket hit /app/ — use root ws path instead
    hmr: {
      path: "/@vite/ws",
      host: "localhost",
      protocol: "ws",
      clientPort: 5173,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
