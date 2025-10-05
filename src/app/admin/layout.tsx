"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { LayoutDashboard, BookOpen, Users, BookMarked, GitPullRequest, FileText, Menu, X, LogOut } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/books", label: "الكتب", icon: BookOpen },
  { href: "/admin/users", label: "المستخدمين", icon: Users },
  { href: "/admin/loans", label: "الإعارات", icon: BookMarked },
  { href: "/admin/contributions", label: "المساهمات", icon: GitPullRequest },
  { href: "/admin/reports", label: "التقارير", icon: FileText },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background" dir="rtl">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 lg:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-40 w-72 transform bg-card border-l border-border transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 p-6 border-b border-border">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-primary/10">
            <Image src="/image.png" alt="Waaeen Logo" fill className="object-contain p-1" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">وعيّن</h2>
            <p className="text-xs text-muted-foreground">لوحة الإدارة</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform group-hover:scale-110",
                    isActive && "text-primary-foreground",
                  )}
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              // Add logout logic here
              window.location.href = "/login"
            }}
          >
            <LogOut className="h-5 w-5" />
            <span>تسجيل الخروج</span>
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 lg:p-8 max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
