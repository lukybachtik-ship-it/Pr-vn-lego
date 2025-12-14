"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Bell,
  X,
} from "lucide-react"
import { type Invoice, formatCurrency } from "@/lib/cash-flow"

interface MonthlyDetailPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "income" | "expense"
  invoices: Invoice[]
  monthLabel: string
  onAddReminder?: (invoice: Invoice) => void
  onMarkAsPaid?: (invoiceId: string) => void
}

export function MonthlyDetailPopup({
  open,
  onOpenChange,
  type,
  invoices,
  monthLabel,
  onAddReminder,
  onMarkAsPaid,
}: MonthlyDetailPopupProps) {
  const [activeTab, setActiveTab] = useState<"all" | "unpaid" | "paid">("all")

  const filteredByType = invoices.filter((inv) => inv.type === type)

  const getFilteredInvoices = () => {
    switch (activeTab) {
      case "unpaid":
        return filteredByType.filter((inv) => !inv.isPaid)
      case "paid":
        return filteredByType.filter((inv) => inv.isPaid)
      default:
        return filteredByType
    }
  }

  const displayInvoices = getFilteredInvoices()
  const unpaidCount = filteredByType.filter((inv) => !inv.isPaid).length
  const paidCount = filteredByType.filter((inv) => inv.isPaid).length
  const overdueCount = filteredByType.filter((inv) => !inv.isPaid && new Date(inv.dueDate) < new Date()).length

  const totalAmount = filteredByType.reduce((sum, inv) => sum + inv.amount, 0)
  const unpaidAmount = filteredByType.filter((inv) => !inv.isPaid).reduce((sum, inv) => sum + inv.amount, 0)
  const overdueAmount = filteredByType.filter((inv) => !inv.isPaid && new Date(inv.dueDate) < new Date()).reduce((sum, inv) => sum + inv.amount, 0)

  const getStatusIcon = (invoice: Invoice) => {
    if (invoice.isPaid) {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    }
    const isOverdue = new Date(invoice.dueDate) < new Date()
    if (isOverdue) {
      return <AlertTriangle className="w-4 h-4 text-red-600" />
    }
    return <Clock className="w-4 h-4 text-amber-600" />
  }

  const getStatusBadge = (invoice: Invoice) => {
    if (invoice.isPaid) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Zaplaceno
        </Badge>
      )
    }
    const isOverdue = new Date(invoice.dueDate) < new Date()
    if (isOverdue) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
          Po splatnosti
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
        Čeká na platbu
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            {type === "income" ? (
              <div className="p-2 bg-green-100 rounded-lg">
                <ArrowDownCircle className="w-6 h-6 text-green-600" />
              </div>
            ) : (
              <div className="p-2 bg-red-100 rounded-lg">
                <ArrowUpCircle className="w-6 h-6 text-red-600" />
              </div>
            )}
            <div>
              <DialogTitle className="text-xl">
                {type === "income" ? "Příjmy" : "Výdaje"} - {monthLabel}
              </DialogTitle>
              <DialogDescription>
                Celkem: {formatCurrency(totalAmount)} • Nezaplaceno: {formatCurrency(unpaidAmount)}
                {overdueAmount > 0 && (
                  <span className="text-red-600"> • Po splatnosti: {formatCurrency(overdueAmount)}</span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 py-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{filteredByType.length}</div>
            <div className="text-xs text-muted-foreground">Celkem faktur</div>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <div className="text-2xl font-bold text-amber-700">{unpaidCount}</div>
            <div className="text-xs text-amber-600">Nezaplacených</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-700">{overdueCount}</div>
            <div className="text-xs text-red-600">Po splatnosti</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Všechny ({filteredByType.length})</TabsTrigger>
            <TabsTrigger value="unpaid" className="text-amber-700">Nezaplacené ({unpaidCount})</TabsTrigger>
            <TabsTrigger value="paid" className="text-green-700">Zaplacené ({paidCount})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-[340px] pr-4">
              {displayInvoices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Žádné {activeTab === "paid" ? "zaplacené" : activeTab === "unpaid" ? "nezaplacené" : ""} faktury</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {displayInvoices
                    .sort((a, b) => {
                      // Sort unpaid first, then by due date
                      if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1
                      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                    })
                    .map((invoice) => {
                      const isOverdue = !invoice.isPaid && new Date(invoice.dueDate) < new Date()
                      return (
                        <div
                          key={invoice.id}
                          className={`p-4 rounded-lg border transition-all ${
                            isOverdue
                              ? "bg-red-50/50 border-red-200"
                              : invoice.isPaid
                                ? "bg-green-50/30 border-green-200"
                                : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              {getStatusIcon(invoice)}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{invoice.from}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                  <Calendar className="w-3 h-3" />
                                  Splatnost: {new Date(invoice.dueDate).toLocaleDateString("cs-CZ")}
                                </div>
                                {invoice.description && (
                                  <div className="text-xs text-muted-foreground mt-1 truncate">
                                    {invoice.description}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className={`font-bold ${type === "income" ? "text-green-600" : "text-red-600"}`}>
                                {formatCurrency(invoice.amount)}
                              </div>
                              {getStatusBadge(invoice)}
                            </div>
                          </div>

                          {/* Action buttons for unpaid invoices */}
                          {!invoice.isPaid && (
                            <div className="flex gap-2 mt-3 pt-3 border-t border-dashed">
                              {onMarkAsPaid && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 bg-green-50 hover:bg-green-100 text-green-700"
                                  onClick={() => onMarkAsPaid(invoice.id)}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Označit jako zaplacené
                                </Button>
                              )}
                              {onAddReminder && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onAddReminder(invoice)}
                                >
                                  <Bell className="w-3 h-3 mr-1" />
                                  Připomenout
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
