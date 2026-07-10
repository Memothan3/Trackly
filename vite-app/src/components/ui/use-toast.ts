export function toast(message: string, options?: { variant?: "default" | "destructive" }) {
  console.log(`Toast: ${message}`, options)
  // Simple toast implementation - in production you'd use a proper toast library
  alert(options?.variant === "destructive" ? `Error: ${message}` : message)
}

export function useToast() {
  return { toast }
}
