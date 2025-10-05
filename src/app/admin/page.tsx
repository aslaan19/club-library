"use client"

import { useEffect, useState } from "react"
import { StatCard } from "@/components/stat-card"
import { BookOpen, Users, BookMarked, AlertCircle, GitPullRequest, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type Stats = {
  totalBooks: number
  totalUsers: number
  activeLoans: number
  overdueLoans: number
  pendingContributions: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [booksRes, usersRes, loansRes, contributionsRes] = await Promise.all([
          fetch("/api/admin/books/stats"),
          fetch("/api/admin/users/stats"),
          fetch("/api/admin/loans/stats"),
          fetch("/api/admin/contributions/stats"),
        ])

        const [books, users, loans, contributions] = await Promise.all([
          booksRes.json(),
          usersRes.json(),
          loansRes.json(),
          contributionsRes.json(),
        ])

        setStats({
          totalBooks: books.total,
          totalUsers: users.total,
          activeLoans: loans.active,
          overdueLoans: loans.overdue,
          pendingContributions: contributions.pending,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">خطأ في تحميل البيانات</CardTitle>
          <CardDescription>فشل في تحميل إحصائيات لوحة التحكم</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">لوحة التحكم</h1>
        <p className="text-muted-foreground text-lg">نظرة عامة على نظام المكتبة</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="إجمالي الكتب"
          value={stats.totalBooks}
          icon={BookOpen}
          description="عدد الكتب في المكتبة"
          className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20"
        />

        <StatCard
          title="إجمالي المستخدمين"
          value={stats.totalUsers}
          icon={Users}
          description="المستخدمين المسجلين"
          className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20"
        />

        <StatCard
          title="الإعارات النشطة"
          value={stats.activeLoans}
          icon={BookMarked}
          description="الكتب المستعارة حالياً"
          className="bg-gradient-to-br from-success/5 to-success/10 border-success/20"
        />

        <StatCard
          title="الإعارات المتأخرة"
          value={stats.overdueLoans}
          icon={AlertCircle}
          description="تحتاج إلى متابعة"
          className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20"
        />

        <StatCard
          title="المساهمات المعلقة"
          value={stats.pendingContributions}
          icon={GitPullRequest}
          description="بانتظار المراجعة"
          className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20"
        />

        {/* Quick Actions Card */}
        <Card className="bg-gradient-to-br from-muted/50 to-muted border-muted-foreground/20">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/admin/books/add" className="block text-sm text-primary hover:underline">
              + إضافة كتاب جديد
            </a>
            <a href="/admin/contributions" className="block text-sm text-primary hover:underline">
              → مراجعة المساهمات
            </a>
            <a href="/admin/loans" className="block text-sm text-primary hover:underline">
              → إدارة الإعارات
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              نشاط المكتبة
            </CardTitle>
            <CardDescription>آخر التحديثات والإحصائيات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm">الكتب المضافة هذا الشهر</span>
              <span className="font-bold text-success">+12</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm">المستخدمين الجدد</span>
              <span className="font-bold text-accent">+8</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm">الإعارات هذا الأسبوع</span>
              <span className="font-bold text-primary">24</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              تنبيهات مهمة
            </CardTitle>
            <CardDescription>عناصر تحتاج إلى انتباهك</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.overdueLoans > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">إعارات متأخرة</p>
                  <p className="text-xs text-muted-foreground">{stats.overdueLoans} إعارة تحتاج إلى متابعة</p>
                </div>
              </div>
            )}

            {stats.pendingContributions > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <GitPullRequest className="h-5 w-5 text-warning flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">مساهمات معلقة</p>
                  <p className="text-xs text-muted-foreground">{stats.pendingContributions} مساهمة بانتظار المراجعة</p>
                </div>
              </div>
            )}

            {stats.overdueLoans === 0 && stats.pendingContributions === 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                <TrendingUp className="h-5 w-5 text-success flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">كل شيء على ما يرام!</p>
                  <p className="text-xs text-muted-foreground">لا توجد تنبيهات في الوقت الحالي</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
