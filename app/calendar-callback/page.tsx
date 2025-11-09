"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function CalendarCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const accessToken = searchParams.get("access_token")
    const refreshToken = searchParams.get("refresh_token")

    if (accessToken) {
      // Store tokens
      localStorage.setItem("google_calendar_token", accessToken)
      if (refreshToken) {
        localStorage.setItem("google_calendar_refresh_token", refreshToken)
      }

      // Get return URL and redirect back
      const returnUrl = localStorage.getItem("calendar_return_url") || "/"
      localStorage.removeItem("calendar_return_url")

      // Add flag to reopen dialog
      router.push(`${returnUrl}?calendar_success=true`)
    } else {
      // No token, go to homepage
      router.push("/")
    }
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Dokončuji přihlášení...</p>
      </div>
    </div>
  )
}
