"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { Calendar, BookOpen } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"

interface LoanRowProps {
  id: string
  bookTitle: string
  bookAuthor: string
  dueDate: Date
  isOverdue: boolean
  onReturn?: () => void
}

export function LoanRow({ id, bookTitle, bookAuthor, dueDate, isOverdue, onReturn }: LoanRowProps) {
  return (
    <Card className="p-4 transition-all hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-lg mb-1">{bookTitle}</h4>
            <p className="text-sm text-muted-foreground mb-2">{bookAuthor}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>موعد الإرجاع: {formatDistanceToNow(dueDate, { addSuffix: true, locale: ar })}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={isOverdue ? "overdue" : "active"} />
          {onReturn && (
            <Button onClick={onReturn} variant="outline" size="sm">
              إرجاع
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
