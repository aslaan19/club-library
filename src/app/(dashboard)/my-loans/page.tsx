"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import type { Book, Loan } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/status-badge"
import { BookOpen, Calendar, Loader2 } from "lucide-react"

type LoanWithBook = Loan & {
  book: Book
}

export default function MyLoansPage() {
  const [loans, setLoans] = useState<LoanWithBook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "RETURNED">("ALL")

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true)
        const status = filter === "ALL" ? "" : filter
        const response = await fetch(`/api/loans${status ? `?status=${status}` : ""}`)
        if (!response.ok) {
          throw new Error("فشل في تحميل الإعارات")
        }
        const data = await response.json()
        setLoans(data)
      } catch (err) {
        setError("فشل في تحميل الإعارات")
      } finally {
        setLoading(false)
      }
    }

    fetchLoans()
  }, [filter])

  const getStatusForLoan = (loan: LoanWithBook) => {
    if (loan.status === "RETURNED") return "borrowed"
    if (new Date() > new Date(loan.dueDate)) return "overdue"
    return "active"
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <div className="text-destructive text-lg">{error}</div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
          إعاراتي
        </h1>
        <p className="text-muted-foreground text-lg">تتبع جميع الكتب المستعارة وتواريخ الإرجاع</p>
      </div>

      <Tabs defaultValue="ALL" className="w-full" onValueChange={(value: any) => setFilter(value as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
          <TabsTrigger value="ALL" className="text-base">
            الكل
          </TabsTrigger>
          <TabsTrigger value="ACTIVE" className="text-base">
            نشطة
          </TabsTrigger>
          <TabsTrigger value="RETURNED" className="text-base">
            مُرجعة
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : loans.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-6 rounded-full bg-muted">
                  <BookOpen className="h-16 w-16 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold">لا توجد إعارات</h3>
                <p className="text-muted-foreground max-w-md">
                  {filter === "ALL"
                    ? "لم تقم بإستعارة أي كتب بعد. تصفح المكتبة وابدأ القراءة!"
                    : filter === "ACTIVE"
                      ? "لا توجد إعارات نشطة حالياً"
                      : "لم تقم بإرجاع أي كتب بعد"}
                </p>
                <Link
                  href="/books"
                  className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <BookOpen className="h-5 w-5" />
                  تصفح الكتب
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loans.map((loan) => (
                <Link href={`/my-loans/${loan.id}`} key={loan.id} className="group">
                  <Card className="overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 h-full">
                    <div className="flex gap-4 p-5">
                      <div className="w-24 h-32 relative flex-shrink-0 rounded-lg overflow-hidden shadow-md">
                        <Image
                          src={loan.book.coverImage || "/placeholder.svg?height=128&width=96&query=book"}
                          alt={loan.book.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h3 className="font-bold text-lg mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                          {loan.book.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{loan.book.author}</p>

                        <div className="mt-auto space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(loan.borrowDate), "d MMM yyyy", { locale: ar })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">الإرجاع:</span>
                            <span
                              className={
                                new Date() > new Date(loan.dueDate) && loan.status !== "RETURNED"
                                  ? "text-destructive font-medium"
                                  : ""
                              }
                            >
                              {format(new Date(loan.dueDate), "d MMM yyyy", { locale: ar })}
                            </span>
                          </div>
                          <div className="pt-2">
                            <StatusBadge status={getStatusForLoan(loan)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
