import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?calendar_error=${error}`)
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?calendar_error=no_code`)
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/calendar/callback`,
        grant_type: "authorization_code",
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokens.access_token) {
      throw new Error("No access token received")
    }

    // Redirect back to stored URL or homepage
    // We'll use a temporary page that handles the token storage and redirect
    const response = NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/calendar-callback?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token || ""}`
    )

    return response
  } catch (error) {
    console.error("Calendar auth error:", error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?calendar_error=token_exchange_failed`)
  }
}
