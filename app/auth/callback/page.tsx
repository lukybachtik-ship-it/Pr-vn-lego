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
        // Get the hash from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get("access_token")
        const refreshToken = hashParams.get("refresh_token")
        const type = hashParams.get("type")

        if (type === "signup" && accessToken) {
          // Email confirmation successful
          setStatus("success")
          setMessage("Email úspěšně ověřen! Nyní se můžeš přihlásit.")
        } else if (accessToken && refreshToken) {
          // Set the session
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          setStatus("success")
          setMessage("Úspěšně přihlášen!")

          // Redirect to home after 2 seconds
          setTimeout(() => {
            router.push("/")
          }, 2000)
        } else {
          setStatus("error")
          setMessage("Neplatný odkaz nebo již vypršel.")
        }
      } catch (error) {
        console.error("Auth callback error:", error)
        setStatus("error")
        setMessage("Nastala chyba při ověření emailu.")
      }
    }

    handleCallback()
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
