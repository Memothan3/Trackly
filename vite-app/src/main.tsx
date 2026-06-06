import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { primeOAuthRedirectResult } from "@/lib/auth-service"
import { TracklyProvider } from "@/contexts/trackly-provider"

// Chrome needs getRedirectResult before React/auth listeners start.
primeOAuthRedirectResult()

document.documentElement.setAttribute("dir", "ltr")
document.documentElement.lang = "en"
localStorage.removeItem("trackly-direction")

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="trackly-theme">
      <TracklyProvider>
        <App />
      </TracklyProvider>
    </ThemeProvider>
  </StrictMode>
)
