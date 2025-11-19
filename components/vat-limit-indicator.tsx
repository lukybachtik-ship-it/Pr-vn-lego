"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"
import { calculateVATLimit, getVATLimitSeverity, getVATLimitMessage } from "@/lib/vat-limit"
import { useEffect, useState } from "react"
import type { VATLimitStatus } from "@/lib/vat-limit"

export function VATLimitIndicator() {
  const [status, setStatus] = useState<VATLimitStatus | null>(null)

  useEffect(() => {
    setStatus(calculateVATLimit())
  }, [])

  if (!status) return null

  const severity = getVATLimitSeverity(status)
  const message = getVATLimitMessage(status)

  // Kompaktní režim pro nízké hodnoty (< 80%)
  const isCompact = status.percentageUsed < 80

  const severityConfig = {
    safe: {
      color: "bg-green-500",
      icon: <CheckCircle className={isCompact ? "w-4 h-4 text-green-600" : "w-5 h-5 text-green-600"} />,
      cardClass: isCompact ? "border-green-200" : "border-green-200 bg-green-50",
      titleClass: "text-green-900",
    },
    warning: {
      color: "bg-yellow-500",
      icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
      cardClass: "border-yellow-300 bg-yellow-50",
      titleClass: "text-yellow-900",
    },
    danger: {
      color: "bg-red-500",
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
      cardClass: "border-red-300 bg-red-50",
      titleClass: "text-red-900",
    },
  }

  const config = severityConfig[severity]

  // Kompaktní verze pro < 80%
  if (isCompact) {
    return (
      <Card className={config.cardClass}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {config.icon}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Limit pro plátce DPH</p>
                <p className="text-xs text-muted-foreground">{status.percentageUsed}% využito</p>
              </div>
            </div>
            <div className="flex-1 max-w-xs">
              <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${config.color} transition-all duration-300`}
                  style={{ width: `${Math.min(status.percentageUsed, 100)}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{Math.round(status.totalRevenueLast12Months).toLocaleString("cs-CZ")} Kč</p>
              <p className="text-xs text-muted-foreground">z 2M Kč</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Rozšířená verze pro >= 80%
  return (
    <Card className={config.cardClass}>
      <CardHeader>
        <CardTitle className={`text-lg flex items-center gap-2 ${config.titleClass}`}>
          {config.icon}
          Limit pro plátce DPH
        </CardTitle>
        <CardDescription className="text-sm">{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="relative w-full h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full ${config.color} transition-all duration-300`}
              style={{ width: `${Math.min(status.percentageUsed, 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Tržby za 12 měsíců</p>
              <p className="font-semibold">{Math.round(status.totalRevenueLast12Months).toLocaleString("cs-CZ")} Kč</p>
            </div>
            <div>
              <p className="text-muted-foreground">Zbývá do limitu</p>
              <p className="font-semibold">{Math.round(status.remainingCZK).toLocaleString("cs-CZ")} Kč</p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground pt-2 border-t">
            Limit: {status.limitCZK.toLocaleString("cs-CZ")} Kč • Využito: {status.percentageUsed}%
            {status.monthsUntilLimit !== null && status.projectedOverrun && (
              <>
                {" "}
                • <span className="text-yellow-700 font-medium">Projekce: {status.monthsUntilLimit} měsíců</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
