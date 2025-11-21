"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Exchange the code from URL for a session
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)

        if (error) {
          console.error("Exchange code error:", error)
          setStatus("error")
          setMessage("Neplatný odkaz nebo již vypršel.")
          return
        }

        // Success - email verified
        setStatus("success")
        setMessage("Email úspěšně ověřen! Přesměrovávám...")

        // Redirect to home after 2 seconds
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } catch (error) {
        console.error("Auth callback error:", error)
        setStatus("error")
        setMessage("Nastala chyba při ověření emailu.")
      }
    }

    // Small delay to ensure window.location is ready
    const timer = setTimeout(() => {
      handleCallback()
    }, 100)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && <Loader2 className="w-12 h-12 animate-spin text-primary" />}
            {status === "success" && <CheckCircle className="w-12 h-12 text-green-600" />}
            {status === "error" && <XCircle className="w-12 h-12 text-destructive" />}
          </div>
          <CardTitle>
            {status === "loading" && "Ověřuji email..."}
            {status === "success" && "Úspěch!"}
            {status === "error" && "Chyba"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {status === "success" && (
            <Button onClick={() => router.push("/login")}>Přejít na přihlášení</Button>
          )}
          {status === "error" && (
            <Button variant="outline" onClick={() => router.push("/login")}>
              Zpět na přihlášení
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
