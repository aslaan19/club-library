"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import Link from "next/link"
import { BookOpen, Users, BookMarked, AlertCircle, TrendingUp, Award, Activity, Calendar } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ReportData = {
  totalBooks: number
  totalUsers: number
  totalLoans: number
  activeLoans: number
  overdueLoans: number
  returnedLoans: number
  mostBorrowedBooks: {
    id: string
    title: string
    author: string
    borrowCount: number
  }[]
  topContributors: {
    id: string
    name: string
    contributionCount: number
  }[]
  recentActivities: {
    type: "LOAN" | "RETURN" | "CONTRIBUTION"
    date: string
    details: string
    userName: string
    bookTitle?: string
  }[]
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month")

  useEffect(() => {
    fetchReports()
  }, [timeframe])

  const fetchReports = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/admin/reports?timeframe=${timeframe}`)
      if (!response.ok) throw new Error("فشل في تحميل التقارير")
      const reportData = await response.json()
      setData(reportData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-4 p-6">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div>
              <h3 className="font-semibold text-destructive">حدث خطأ</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">لا توجد بيانات</h3>
            <p className="mt-2 text-sm text-muted-foreground">لم يتم العثور على تقارير متاحة</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">التقارير والإحصائيات</h1>
          <p className="text-muted-foreground">تحليل شامل لنشاط المكتبة والطلاب</p>
        </div>

        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)} className="w-auto">
          <TabsList>
            <TabsTrigger value="week">أسبوع</TabsTrigger>
            <TabsTrigger value="month">شهر</TabsTrigger>
            <TabsTrigger value="year">سنة</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي الكتب"
          value={data.totalBooks}
          icon={BookOpen}
          description="عدد الكتب في المكتبة"
          className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
        />
        <StatCard
          title="الاستعارات النشطة"
          value={data.activeLoans}
          icon={BookMarked}
          description="الكتب المستعارة حاليًا"
          className="border-success/20 bg-gradient-to-br from-success/5 to-transparent"
        />
        <StatCard
          title="الاستعارات المتأخرة"
          value={data.overdueLoans}
          icon={AlertCircle}
          description="تحتاج إلى متابعة"
          className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-transparent"
        />
        <StatCard
          title="إجمالي الطلاب"
          value={data.totalUsers}
          icon={Users}
          description="المسجلين في النظام"
          className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-l from-primary/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>أكثر الكتب استعارة</CardTitle>
              </div>
            </div>
            <CardDescription>الكتب الأكثر شعبية خلال الفترة المحددة</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {data.mostBorrowedBooks.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">لا توجد بيانات متاحة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.mostBorrowedBooks.map((book, index) => (
                  <div
                    key={book.id}
                    className="group flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-sm font-bold text-primary-foreground">
                        {index + 1}
                      </div>
                      <div>
                        <Link
                          href={`/books/${book.id}`}
                          className="font-semibold transition-colors group-hover:text-primary"
                        >
                          {book.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">{book.author}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-bold">
                      {book.borrowCount} مرة
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-l from-success/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-success" />
                <CardTitle>أكثر المتطوعين نشاطًا</CardTitle>
              </div>
            </div>
            <CardDescription>الطلاب الذين ساهموا بأكبر عدد من الكتب</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {data.topContributors && data.topContributors.length > 0 ? (
              <div className="space-y-3">
                {data.topContributors.map((contributor, index) => (
                  <div
                    key={contributor.id}
                    className="group flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:border-success/50 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-success to-success/70 text-sm font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <Link
                          href={`/admin/users/${contributor.id}`}
                          className="font-semibold transition-colors group-hover:text-success"
                        >
                          {contributor.name}
                        </Link>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-success/10 text-success hover:bg-success/20">
                      {contributor.contributionCount} كتاب
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Award className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">لا يوجد متطوعون حاليًا</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-l from-accent/5 to-transparent">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" />
            <CardTitle>النشاطات الأخيرة</CardTitle>
          </div>
          <CardDescription>آخر العمليات التي تمت في النظام</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {data.recentActivities.length === 0 ? (
            <div className="py-12 text-center">
              <Activity className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">لا توجد نشاطات حديثة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="group relative flex gap-4 rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        activity.type === "LOAN"
                          ? "bg-primary/10 text-primary"
                          : activity.type === "RETURN"
                            ? "bg-success/10 text-success"
                            : "bg-accent/10 text-accent"
                      }`}
                    >
                      {activity.type === "LOAN" ? (
                        <BookMarked className="h-5 w-5" />
                      ) : activity.type === "RETURN" ? (
                        <BookOpen className="h-5 w-5" />
                      ) : (
                        <Award className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{activity.details}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.userName}
                          {activity.bookTitle && ` - ${activity.bookTitle}`}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          activity.type === "LOAN"
                            ? "border-primary/50 bg-primary/5 text-primary"
                            : activity.type === "RETURN"
                              ? "border-success/50 bg-success/5 text-success"
                              : "border-accent/50 bg-accent/5 text-accent"
                        }
                      >
                        {activity.type === "LOAN" ? "استعارة" : activity.type === "RETURN" ? "إرجاع" : "تطوع"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(activity.date), "dd MMMM yyyy - h:mm a", {
                        locale: ar,
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
