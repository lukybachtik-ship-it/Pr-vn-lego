"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, CheckCircle, Clock, AlertCircle, Bell } from "lucide-react"
import type { ContractTimeline, ContractDeadline } from "@/lib/contract-timeline"
import { formatDate, getDeadlineUrgency } from "@/lib/contract-timeline"

interface ContractTimelineProps {
  timeline: ContractTimeline
  onToggleComplete?: (deadlineId: string) => void
}

export function ContractTimelineComponent({ timeline, onToggleComplete }: ContractTimelineProps) {
  const getDeadlineIcon = (type: ContractDeadline["type"]) => {
    switch (type) {
      case "payment":
        return "💰"
      case "delivery":
        return "📦"
      case "deadline":
        return "⏰"
      case "renewal":
        return "🔄"
      case "termination":
        return "🔚"
      case "warranty":
        return "🛡️"
      default:
        return "📅"
    }
  }

  const getUrgencyBadge = (deadline: ContractDeadline) => {
    const urgency = getDeadlineUrgency(deadline)

    if (deadline.completed) {
      return (
        <Badge variant="outline" className="bg-gray-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Splněno
        </Badge>
      )
    }

    if (urgency === "red") {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Po termínu ({Math.abs(deadline.daysUntil)} dnů)
        </Badge>
      )
    }

    if (urgency === "yellow") {
      return (
        <Badge className="bg-yellow-500">
          <Clock className="w-3 h-3 mr-1" />
          Blíží se ({deadline.daysUntil} dnů)
        </Badge>
      )
    }

    return (
      <Badge variant="secondary">
        <Calendar className="w-3 h-3 mr-1" />
        Za {deadline.daysUntil} dnů
      </Badge>
    )
  }

  if (timeline.deadlines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Časová osa smlouvy
          </CardTitle>
          <CardDescription>V této smlouvě nejsou žádné termíny k hlídání</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Časová osa smlouvy
        </CardTitle>
        <CardDescription>
          {timeline.deadlines.length} termínů
          {timeline.overdueCount > 0 && (
            <span className="text-destructive ml-2">• {timeline.overdueCount} po termínu</span>
          )}
          {timeline.upcomingCount > 0 && (
            <span className="text-yellow-600 ml-2">• {timeline.upcomingCount} se blíží</span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Next Deadline Alert */}
        {timeline.nextDeadline && !timeline.nextDeadline.completed && (
          <Alert className={timeline.nextDeadline.isUpcoming ? "border-yellow-500 bg-yellow-50" : ""}>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold">Další termín: {timeline.nextDeadline.title}</p>
              <p className="text-sm">
                {formatDate(timeline.nextDeadline.date)}
                {timeline.nextDeadline.description && ` - ${timeline.nextDeadline.description}`}
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Timeline List */}
        <div className="space-y-3">
          {timeline.deadlines.map((deadline) => (
            <div
              key={deadline.id}
              className={`flex items-start gap-3 p-3 border rounded-lg ${
                deadline.completed ? "bg-gray-50 opacity-60" : ""
              } ${deadline.isPast && !deadline.completed ? "border-destructive bg-destructive/5" : ""} ${
                deadline.isUpcoming && !deadline.completed ? "border-yellow-500 bg-yellow-50" : ""
              }`}
            >
              <span className="text-2xl">{getDeadlineIcon(deadline.type)}</span>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className={`font-semibold ${deadline.completed ? "line-through" : ""}`}>{deadline.title}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(deadline.date)}</p>
                    {deadline.description && (
                      <p className="text-xs text-muted-foreground mt-1">{deadline.description}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {getUrgencyBadge(deadline)}
                    {onToggleComplete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onToggleComplete(deadline.id)}
                        className="h-7 text-xs"
                      >
                        {deadline.completed ? "Zrušit" : "Splněno"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-destructive">{timeline.overdueCount}</p>
              <p className="text-xs text-muted-foreground">Po termínu</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{timeline.upcomingCount}</p>
              <p className="text-xs text-muted-foreground">Blíží se</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">
                {timeline.deadlines.filter((d) => d.completed).length}
              </p>
              <p className="text-xs text-muted-foreground">Splněno</p>
            </div>
          </div>
        </div>

        {/* Notifications Hint */}
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <p className="font-semibold">Tip: Nastavte si upomínky</p>
            <p>Přidejte si termíny do kalendáře, aby vás aplikace včas upozornila.</p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
