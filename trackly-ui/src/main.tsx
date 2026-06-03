import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { DirectionProvider } from "@/components/direction-provider.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DirectionProvider defaultDirection="rtl">
      <ThemeProvider defaultTheme="dark" storageKey="trackly-theme">
        <App />
      </ThemeProvider>
    </DirectionProvider>
  </StrictMode>,
)
