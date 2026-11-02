import { NextResponse } from "next/server"

// Free Supabase projects get paused after 7 days without activity.
// Vercel Cron (see vercel.json) calls this once a day so the database stays awake.
export const dynamic = "force-dynamic"

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json({ ok: false, error: "Missing Supabase environment variables" }, { status: 500 })
  }

  try {
    const response = await fetch(`${url}/rest/v1/contracts?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    })

    return NextResponse.json({ ok: response.ok, status: response.status }, { status: response.ok ? 200 : 502 })
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 502 })
  }
}
