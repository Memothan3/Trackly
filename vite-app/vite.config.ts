import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { legacyTracklyPlugin } from "./legacy-trackly-plugin"

const tracklyRoot = path.resolve(__dirname, "..")

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), legacyTracklyPlugin(tracklyRoot)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
