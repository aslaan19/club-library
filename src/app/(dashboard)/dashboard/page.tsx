"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/stat-card"
import { LoanRow } from "@/components/loan-row"
import { BookOpen, Clock, TrendingUp, Gift, LogOut, Library, FileText } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [activeLoans, setActiveLoans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      setUser(authUser)

      const response = await fetch("/api/loans?status=ACTIVE")
      const loans = await response.json()
      setActiveLoans(loans)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const overdueCount = activeLoans.filter((l) => new Date(l.dueDate) < new Date()).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-muted-foreground">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-12">
                <Image src="/image.png" alt="مكتبة وعيّن" fill className="object-contain" />
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <span>•</span>
                <span>نظام إدارة المكتبة</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-sm text-muted-foreground">{user?.email}</div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="ml-2 h-4 w-4" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-balance">مرحبًا، {user?.user_metadata?.name || "طالب"}</h1>
          <p className="text-muted-foreground text-lg">لوحة التحكم الخاصة بك</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="الاستعارات النشطة"
            value={activeLoans.length}
            icon={BookOpen}
            description="الكتب المستعارة حاليًا"
            className="border-r-4 border-primary"
          />
          <StatCard
            title="الكتب المتأخرة"
            value={overdueCount}
            icon={Clock}
            description="تحتاج إلى إرجاع"
            className="border-r-4 border-destructive"
          />
          <StatCard
            title="إجمالي الاستعارات"
            value={activeLoans.length}
            icon={TrendingUp}
            description="منذ بداية العام"
            className="border-r-4 border-accent"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/books">
            <Button variant="default" className="w-full h-24 text-lg font-bold" size="lg">
              <Library className="ml-2 h-6 w-6" />
              تصفح الكتب
            </Button>
          </Link>
          <Link href="/my-loans">
            <Button variant="outline" className="w-full h-24 text-lg font-bold border-2 bg-transparent" size="lg">
              <FileText className="ml-2 h-6 w-6" />
              استعاراتي
            </Button>
          </Link>
          <Link href="/books/add">
            <Button
              variant="outline"
              className="w-full h-24 text-lg font-bold border-2 border-success text-success hover:bg-success hover:text-success-foreground bg-transparent"
              size="lg"
            >
              <BookOpen className="ml-2 h-6 w-6" />
              إضافة كتاب
            </Button>
          </Link>
          <Link href="/my-contributions">
            <Button
              variant="outline"
              className="w-full h-24 text-lg font-bold border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
              size="lg"
            >
              <Gift className="ml-2 h-6 w-6" />
              مساهماتي
            </Button>
          </Link>
        </div>

        {/* Active Loans */}
        {activeLoans.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">الاستعارات النشطة</h2>
            <div className="space-y-3">
              {activeLoans.map((loan) => (
                <LoanRow
                  key={loan.id}
                  id={loan.id}
                  bookTitle={loan.book.title}
                  bookAuthor={loan.book.author}
                  dueDate={new Date(loan.dueDate)}
                  isOverdue={new Date(loan.dueDate) < new Date()}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">لا توجد استعارات نشطة</h3>
            <p className="text-muted-foreground mb-6">ابدأ باستعارة كتاب من المكتبة</p>
            <Link href="/books">
              <Button size="lg">تصفح الكتب</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
