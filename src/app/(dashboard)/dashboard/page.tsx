"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoanRow } from "@/components/loan-row";
import {
  BookOpen,
  Clock,
  TrendingUp,
  Gift,
  LogOut,
  Library,
  FileText,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      setUser(authUser);

      const response = await fetch("/api/loans?status=ACTIVE");
      const loans = await response.json();
      setActiveLoans(loans);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const overdueCount = activeLoans.filter(
    (l) => new Date(l.dueDate) < new Date()
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <div className="text-xl font-bold text-muted-foreground">
            جاري التحميل...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Content */}
      <div className="container mx-auto px-4  space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl p-2 text-balance bg-gradient-to-l from-foreground via-foreground to-primary bg-clip-text text-transparent">
            مرحبًا، {user?.user_metadata?.name || "طالب"} 👋
          </h1>
          <p className="text-muted-foreground text-lg ">
            إليك نظرة عامة على نشاطك في المكتبة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"></div>
            <div className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">
                    الاستعارات النشطة
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {activeLoans.length}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                الكتب المستعارة حاليًا
              </p>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent"></div>
            <div className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
                  <Clock className="h-6 w-6 text-destructive" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">
                    الكتب المتأخرة
                  </p>
                  <p className="text-3xl font-bold mt-1">{overdueCount}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                تحتاج إلى إرجاع فوري
              </p>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-success/5 to-transparent"></div>
            <div className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-success/10 group-hover:bg-success/20 transition-colors">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">
                    إجمالي الاستعارات
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {activeLoans.length}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">منذ بداية العام</p>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">الإجراءات السريعة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/books" className="group">
              <Card className="h-full border-2 border-primary/20 hover:border-primary hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="relative p-6 space-y-3">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-primary to-primary/50"></div>
                  <div className="flex items-center justify-between">
                    <Library className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">تصفح الكتب</h3>
                    <p className="text-sm text-muted-foreground">
                      استكشف مكتبتنا الواسعة
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/my-loans" className="group">
              <Card className="h-full border-2 border-muted hover:border-foreground/20 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="relative p-6 space-y-3">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-foreground/50 to-foreground/20"></div>
                  <div className="flex items-center justify-between">
                    <FileText className="h-8 w-8 text-foreground group-hover:scale-110 transition-transform" />
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">استعاراتي</h3>
                    <p className="text-sm text-muted-foreground">
                      تتبع كتبك المستعارة
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/books/add" className="group">
              <Card className="h-full border-2 border-success/20 hover:border-success hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="relative p-6 space-y-3">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-success to-success/50"></div>
                  <div className="flex items-center justify-between">
                    <BookOpen className="h-8 w-8 text-success group-hover:scale-110 transition-transform" />
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-success">
                      إضافة كتاب
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      ساهم في إثراء المكتبة
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/my-contributions" className="group">
              <Card className="h-full border-2 border-warning/20 hover:border-warning hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="relative p-6 space-y-3">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-warning to-warning/50"></div>
                  <div className="flex items-center justify-between">
                    <Gift className="h-8 w-8 text-warning group-hover:scale-110 transition-transform" />
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-warning">مساهماتي</h3>
                    <p className="text-sm text-muted-foreground">
                      راجع كتبك المضافة
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {activeLoans.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">الاستعارات النشطة</h2>
              <Link href="/my-loans">
                <Button variant="ghost" size="sm" className="gap-2">
                  عرض الكل
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {activeLoans.slice(0, 3).map((loan) => (
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
          <Card className="border-2 border-dashed border-muted-foreground/20">
            <div className="text-center py-16 px-4">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">لا توجد استعارات نشطة</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                ابدأ رحلتك في عالم المعرفة باستعارة كتاب من مكتبتنا الغنية
              </p>
              <Link href="/books">
                <Button size="lg" className="gap-2">
                  <Library className="h-5 w-5" />
                  تصفح الكتب
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
