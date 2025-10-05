import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "available" | "borrowed" | "overdue" | "active"
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    available: {
      label: "متاح",
      className: "bg-success/10 text-success hover:bg-success/20 border-success/20",
    },
    borrowed: {
      label: "مُستعار",
      className: "bg-muted text-muted-foreground hover:bg-muted/80",
    },
    overdue: {
      label: "متأخر",
      className: "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20",
    },
    active: {
      label: "نشط",
      className: "bg-accent/10 text-accent hover:bg-accent/20 border-accent/20",
    },
  }

  const variant = variants[status]

  return (
    <Badge className={cn(variant.className, className)} variant="outline">
      {variant.label}
    </Badge>
  )
}
