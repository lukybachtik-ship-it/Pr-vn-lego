"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-destructive" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Něco se pokazilo</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Omlouváme se, došlo k neočekávané chybě. Zkuste stránku obnovit nebo se vrátit na hlavní stránku.
        </p>
        {error.message && (
          <details className="text-left mb-6 p-3 bg-muted rounded-md">
            <summary className="text-xs text-muted-foreground cursor-pointer">
              Technické detaily
            </summary>
            <pre className="text-xs mt-2 overflow-auto text-destructive whitespace-pre-wrap">
              {error.message}
            </pre>
          </details>
        )}
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            <Home className="w-4 h-4 mr-1.5" />
            Domů
          </Button>
          <Button onClick={reset}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Zkusit znovu
          </Button>
        </div>
      </div>
    </div>
  )
}
