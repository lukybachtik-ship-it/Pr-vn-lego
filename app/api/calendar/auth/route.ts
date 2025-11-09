import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/calendar/callback`
  const clientId = process.env.GOOGLE_CLIENT_ID

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  authUrl.searchParams.append("client_id", clientId!)
  authUrl.searchParams.append("redirect_uri", redirectUri)
  authUrl.searchParams.append("response_type", "code")
  authUrl.searchParams.append("scope", "https://www.googleapis.com/auth/calendar.events")
  authUrl.searchParams.append("access_type", "offline")
  authUrl.searchParams.append("prompt", "consent")

  return NextResponse.redirect(authUrl.toString())
}
