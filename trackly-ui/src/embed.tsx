import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { Dashboard } from "@/components/dashboard"
import { TooltipProvider } from "@/components/ui/tooltip"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TooltipProvider>
      <div className="efferd-dashboard-embed min-h-0 bg-background p-4 text-foreground">
        <Dashboard />
      </div>
    </TooltipProvider>
  </StrictMode>,
)
