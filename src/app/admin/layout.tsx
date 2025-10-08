// src/app/admin/layout.tsx
"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BookMarked,
  GitPullRequest,
  FileText,
  Menu,
  X,
  LogOut,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/footer";

const navItems = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/books", label: "الكتب", icon: BookOpen },
  { href: "/admin/users", label: "المستخدمين", icon: Users },
  { href: "/admin/loans", label: "الإعارات", icon: BookMarked },
  { href: "/admin/contributions", label: "المساهمات", icon: GitPullRequest },
  { href: "/admin/reports", label: "التقارير", icon: FileText },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      // Check if user is logged in
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      // Check if user is admin
      const response = await fetch("/api/admin/check-role");
      const data = await response.json();

      if (data.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error("Admin check error:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">غير مصرح</h1>
        <p className="text-muted-foreground mb-6">
          ليس لديك صلاحية الوصول لهذه الصفحة
        </p>
        <Button onClick={() => router.push("/dashboard")}>
          العودة للوحة التحكم
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background flex-col" dir="rtl">
      <div className="flex flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>

        <aside
          className={cn(
            "fixed inset-y-0 right-0 z-40 w-72 transform bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-l border-border/40 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static shadow-xl",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="relative flex items-center gap-3 p-6 border-b border-border/40 bg-gradient-to-l from-primary/5 to-transparent">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-foreground shadow-lg ring-2 ring-primary/20">
              <Image
                src="/image.png"
                alt="Waaeen Logo"
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">وعيّنا</h2>
              <p className="text-xs text-muted-foreground">لوحة الإدارة</p>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-md"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform group-hover:scale-110",
                      isActive && "text-primary-foreground"
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/40 bg-gradient-to-l from-destructive/5 to-transparent">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">تسجيل الخروج</span>
            </Button>
          </div>
        </aside>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 lg:p-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
