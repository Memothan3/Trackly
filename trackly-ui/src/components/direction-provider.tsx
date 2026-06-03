import * as React from "react"
import { Direction } from "radix-ui"

type Direction = "ltr" | "rtl"

const STORAGE_KEY = "trackly-direction"

type DirectionProviderProps = {
  children: React.ReactNode
  defaultDirection?: Direction
}

type DirectionContextValue = {
  direction: Direction
  setDirection: (direction: Direction) => void
}

const DirectionContext = React.createContext<DirectionContextValue | undefined>(
  undefined
)

function applyDocumentDirection(direction: Direction) {
  document.documentElement.setAttribute("dir", direction)
  document.documentElement.lang = "en"
}

export function DirectionProvider({
  children,
  defaultDirection = "rtl",
}: DirectionProviderProps) {
  const [direction, setDirectionState] = React.useState<Direction>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "ltr" || stored === "rtl") return stored
    return defaultDirection
  })

  const setDirection = React.useCallback((next: Direction) => {
    localStorage.setItem(STORAGE_KEY, next)
    setDirectionState(next)
  }, [])

  React.useEffect(() => {
    applyDocumentDirection(direction)
  }, [direction])

  const value = React.useMemo(
    () => ({ direction, setDirection }),
    [direction, setDirection]
  )

  return (
    <DirectionContext.Provider value={value}>
      <Direction.Provider dir={direction}>{children}</Direction.Provider>
    </DirectionContext.Provider>
  )
}

export function useDirection() {
  const context = React.useContext(DirectionContext)
  if (!context) {
    throw new Error("useDirection must be used within a DirectionProvider")
  }
  return context
}