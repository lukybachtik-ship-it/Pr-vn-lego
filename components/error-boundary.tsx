"use client"

import { Component, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleGoHome = () => {
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-semibold mb-2">Něco se pokazilo</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Omlouváme se, došlo k neočekávané chybě. Zkuste stránku obnovit nebo se vrátit na hlavní stránku.
            </p>
            {this.state.error && (
              <details className="text-left mb-6 p-3 bg-muted rounded-md">
                <summary className="text-xs text-muted-foreground cursor-pointer">
                  Technické detaily
                </summary>
                <pre className="text-xs mt-2 overflow-auto text-destructive">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={this.handleGoHome}>
                <Home className="w-4 h-4 mr-1.5" />
                Domů
              </Button>
              <Button size="sm" onClick={this.handleReset}>
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Zkusit znovu
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
