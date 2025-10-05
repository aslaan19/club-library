"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import type { Book, Loan } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { ArrowRight, Calendar, CheckCircle2, Loader2, AlertCircle } from "lucide-react"

type LoanWithBook = Loan & {
  book: Book
}

type Props = {
  params: Promise<{ id: string }>
}

export default function LoanDetailsPage({ params }: Props) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loan, setLoan] = useState<LoanWithBook | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [returnLoading, setReturnLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const fetchLoan = async () => {
      try {
        const response = await fetch(`/api/loans/${resolvedParams.id}`)
        if (!response.ok) {
          throw new Error("فشل في تحميل تفاصيل الإعارة")
        }
        const data = await response.json()
        setLoan(data)
      } catch (err) {
        setError("فشل في تحميل تفاصيل الإعارة")
      } finally {
        setLoading(false)
      }
    }

    fetchLoan()
  }, [resolvedParams.id])

  const handleReturn = async () => {
    if (!loan || returnLoading) return

    try {
      setReturnLoading(true)
      const response = await fetch(`/api/loans/${loan.id}/return`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("فشل في إرجاع الكتاب")
      }

      const updatedLoan = await response.json()
      setLoan(updatedLoan)
      setShowConfirm(false)

      alert("تم إرجاع الكتاب بنجاح")
    } catch (err) {
      alert("فشل في إرجاع الكتاب. حاول مرة أخرى")
    } finally {
      setReturnLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    )
  }

  if (error || !loan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <div className="text-destructive text-lg mb-4">{error || "الإعارة غير موجودة"}</div>
          <Button onClick={() => router.back()} variant="outline">
            العودة
          </Button>
        </Card>
      </div>
    )
  }

  const isOverdue = new Date() > new Date(loan.dueDate)
  const canReturn = loan.status !== "RETURNED"
  const getStatus = () => {
    if (loan.status === "RETURNED") return "borrowed"
    if (isOverdue) return "overdue"
    return "active"
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button onClick={() => router.back()} variant="ghost" className="mb-6 hover:bg-accent">
        <ArrowRight className="ml-2 h-4 w-4" />
        العودة إلى إعاراتي
      </Button>

      <Card className="overflow-hidden shadow-xl">
        <div className="bg-gradient-to-l from-primary/10 to-accent/10 p-6 border-b">
          <h1 className="text-3xl font-bold mb-2">تفاصيل الإعارة</h1>
          <p className="text-muted-foreground">معلومات كاملة عن الكتاب المستعار</p>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-48 h-72 relative flex-shrink-0 rounded-xl overflow-hidden shadow-2xl mx-auto md:mx-0">
              <Image
                src={loan.book.coverImage || "/placeholder.svg?height=288&width=192&query=book"}
                alt={loan.book.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">{loan.book.title}</h2>
                <p className="text-xl text-muted-foreground mb-4">{loan.book.author}</p>
                <StatusBadge status={getStatus()} className="text-base px-4 py-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-4 bg-accent/5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">تاريخ الإستعارة</span>
                  </div>
                  <p className="text-lg font-bold">
                    {format(new Date(loan.borrowDate), "d MMMM yyyy", { locale: ar })}
                  </p>
                </Card>

                <Card
                  className={`p-4 ${isOverdue && loan.status !== "RETURNED" ? "bg-destructive/5 border-destructive/20" : "bg-accent/5"}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-lg ${isOverdue && loan.status !== "RETURNED" ? "bg-destructive/10" : "bg-primary/10"}`}
                    >
                      <Calendar
                        className={`h-5 w-5 ${isOverdue && loan.status !== "RETURNED" ? "text-destructive" : "text-primary"}`}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">موعد الإرجاع</span>
                  </div>
                  <p
                    className={`text-lg font-bold ${isOverdue && loan.status !== "RETURNED" ? "text-destructive" : ""}`}
                  >
                    {format(new Date(loan.dueDate), "d MMMM yyyy", { locale: ar })}
                  </p>
                  {isOverdue && loan.status !== "RETURNED" && <p className="text-sm text-destructive mt-1">متأخر!</p>}
                </Card>

                {loan.returnDate && (
                  <Card className="p-4 bg-success/5 border-success/20 sm:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-success/10">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      </div>
                      <span className="text-sm text-muted-foreground">تاريخ الإرجاع</span>
                    </div>
                    <p className="text-lg font-bold text-success">
                      {format(new Date(loan.returnDate), "d MMMM yyyy", { locale: ar })}
                    </p>
                  </Card>
                )}
              </div>

              {canReturn && (
                <div className="pt-4">
                  {!showConfirm ? (
                    <Button onClick={() => setShowConfirm(true)} className="w-full text-lg py-6" size="lg">
                      <CheckCircle2 className="ml-2 h-5 w-5" />
                      إرجاع الكتاب
                    </Button>
                  ) : (
                    <Card className="p-4 bg-accent/5 border-accent">
                      <p className="text-center mb-4 font-medium">هل أنت متأكد من إرجاع هذا الكتاب؟</p>
                      <div className="flex gap-3">
                        <Button onClick={handleReturn} disabled={returnLoading} className="flex-1">
                          {returnLoading ? (
                            <>
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                              جاري الإرجاع...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="ml-2 h-4 w-4" />
                              نعم، إرجاع
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => setShowConfirm(false)}
                          variant="outline"
                          className="flex-1"
                          disabled={returnLoading}
                        >
                          إلغاء
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
