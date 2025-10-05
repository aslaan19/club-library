"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookMarked, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type LoanWithDetails = {
  id: string
  status: "ACTIVE" | "RETURNED"
  borrowDate: string
  dueDate: string
  returnDate: string | null
  user: {
    email: string
  }
  book: {
    title: string
    author: string
  }
}

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<LoanWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "OVERDUE" | "RETURNED">("ALL")

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await fetch(`/api/admin/loans?status=${filter}`)
        if (!response.ok) throw new Error("Failed to fetch loans")
        const data = await response.json()
        setLoans(data.loans || [])
      } catch (error) {
        console.error("Failed to fetch loans:", error)
        alert("فشل في تحميل الإعارات")  
      } finally {
        setLoading(false)
      }
    }

    fetchLoans()
  }, [filter])

  const handleReturn = async (id: string, bookTitle: string) => {
    if (!confirm(`هل تريد تأكيد إرجاع الكتاب "${bookTitle}"؟`)) return

    try {
      const response = await fetch(`/api/admin/loans/${id}/return`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to return loan")

      const updatedLoan = await response.json()
      setLoans(loans.map((loan) => (loan.id === id ? updatedLoan : loan)))

      alert("تم إرجاع الكتاب بنجاح")
    } catch (error) {
      console.error("Failed to return loan:", error)
      alert("فشل في إرجاع الكتاب. حاول مرة أخرى")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  const activeLoans = loans.filter((l) => l.status === "ACTIVE")
  const overdueLoans = loans.filter((l) => l.status === "ACTIVE" && new Date() > new Date(l.dueDate))
  const returnedLoans = loans.filter((l) => l.status === "RETURNED")

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">إدارة الإعارات</h1>
        <p className="text-muted-foreground mt-1">متابعة جميع عمليات الإعارة والإرجاع</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookMarked className="h-4 w-4" />
              الإعارات النشطة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeLoans.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              الإعارات المتأخرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overdueLoans.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              الإعارات المرجعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{returnedLoans.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Loans Table with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الإعارات</CardTitle>
          <CardDescription>جميع عمليات الإعارة في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v: string) => setFilter(v as typeof filter)}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="ALL">الكل</TabsTrigger>
              <TabsTrigger value="ACTIVE">نشطة</TabsTrigger>
              <TabsTrigger value="OVERDUE">متأخرة</TabsTrigger>
              <TabsTrigger value="RETURNED">مرجعة</TabsTrigger>
            </TabsList>

            <TabsContent value={filter}>
              {loans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <BookMarked className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد إعارات</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الكتاب</TableHead>
                        <TableHead className="text-right">المستخدم</TableHead>
                        <TableHead className="text-right">تاريخ الاستعارة</TableHead>
                        <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loans.map((loan) => {
                        const isOverdue = new Date() > new Date(loan.dueDate) && loan.status === "ACTIVE"

                        return (
                          <TableRow key={loan.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div>
                                <div className="font-medium">{loan.book.title}</div>
                                <div className="text-sm text-muted-foreground">{loan.book.author}</div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{loan.user.email}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(loan.borrowDate), "d MMM yyyy", { locale: ar })}
                            </TableCell>
                            <TableCell>
                              <span className={isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}>
                                {format(new Date(loan.dueDate), "d MMM yyyy", { locale: ar })}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  loan.status === "RETURNED"
                                    ? "bg-success/10 text-success border-success/20"
                                    : isOverdue
                                      ? "bg-destructive/10 text-destructive border-destructive/20"
                                      : "bg-accent/10 text-accent border-accent/20"
                                }
                              >
                                {loan.status === "RETURNED" ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 ml-1" />
                                    مرجع
                                  </>
                                ) : isOverdue ? (
                                  <>
                                    <AlertCircle className="h-3 w-3 ml-1" />
                                    متأخر
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3 w-3 ml-1" />
                                    نشط
                                  </>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {loan.status === "ACTIVE" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReturn(loan.id, loan.book.title)}
                                  className="hover:bg-success/10 hover:text-success hover:border-success"
                                >
                                  إرجاع
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
