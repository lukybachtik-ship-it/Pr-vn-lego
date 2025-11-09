import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { accessToken, events } = await request.json()

    if (!accessToken || !events || !Array.isArray(events)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const results = []

    for (const event of events) {
      const calendarEvent = {
        summary: event.title,
        description: event.description,
        start: {
          date: event.date, // YYYY-MM-DD format
        },
        end: {
          date: event.date,
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 24 * 60 * 3 }, // 3 days before
            { method: "email", minutes: 24 * 60 }, // 1 day before
          ],
        },
      }

      try {
        const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(calendarEvent),
        })

        const data = await response.json()

        if (response.ok) {
          results.push({ success: true, eventId: data.id, title: event.title })
        } else {
          console.error("Calendar API error:", data)
          results.push({ success: false, error: data.error?.message || JSON.stringify(data), title: event.title })
        }
      } catch (err) {
        console.error("Event creation error:", err)
        results.push({ success: false, error: String(err), title: event.title })
      }
    }

    const successCount = results.filter((r) => r.success).length
    return NextResponse.json({ success: true, results, successCount, totalCount: events.length })
  } catch (error) {
    console.error("Add events error:", error)
    return NextResponse.json({ error: "Failed to add events" }, { status: 500 })
  }
}
