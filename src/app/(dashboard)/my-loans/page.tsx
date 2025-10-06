// src/app/(dashboard)/my-loans/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Book, Loan } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Calendar, Loader2, CheckCircle2, Flame, Clock } from "lucide-react";

type LoanWithBook = Loan & {
  book: Book;
};

const EnhancedStatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "borrowed":
        return {
          label: "مُرجعة",
          icon: <CheckCircle2 className="h-4 w-4" />,
          className: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm",
        };
      case "active":
        return {
          label: "نشطة",
          icon: <Flame className="h-4 w-4" />,
          className: "bg-blue-50 text-blue-700 border-blue-200 shadow-sm",
        };
      case "overdue":
        return {
          label: "متأخرة",
          icon: <Clock className="h-4 w-4" />,
          className: "bg-red-50 text-red-700 border-red-200 shadow-sm",
        };
      default:
        return {
          label: status,
          icon: null,
          className: "bg-gray-50 text-gray-700 border-gray-200",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${config.className}`}
    >
      {config.icon}
      {config.label}
    </div>
  );
};

export default function MyLoansPage() {
  const [loans, setLoans] = useState<LoanWithBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "RETURNED">("ALL");
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          setError("غير مصرح");
          return;
        }

        const status = filter === "ALL" ? "" : filter;
        const response = await fetch(
          `/api/loans${status ? `?status=${status}` : ""}`,
          {
            headers: {
              "x-user-id": session.user.id,
            },
          }
        );

        if (!response.ok) {
          throw new Error("فشل في تحميل الإعارات");
        }
        const data = await response.json();
        setLoans(data);
      } catch (err) {
        setError("فشل في تحميل الإعارات");
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, [filter]);

  const getStatusForLoan = (loan: LoanWithBook) => {
    if (loan.status === "RETURNED") return "borrowed";
    if (new Date() > new Date(loan.dueDate)) return "overdue";
    return "active";
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center shadow-lg border-red-100">
          <div className="text-destructive text-lg font-medium">{error}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 tracking-tight">إعاراتي</h1>
        <p className="text-muted-foreground text-base">
          تتبع جميع الكتب المستعارة وتواريخ الإرجاع
        </p>
      </div>

      <Tabs
        defaultValue="ALL"
        className="w-full"
        onValueChange={(value: any) => setFilter(value)}
      >
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8 h-12 bg-gray-100 p-1">
          <TabsTrigger 
            value="ALL" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold"
          >
            الكل
          </TabsTrigger>
          <TabsTrigger 
            value="ACTIVE"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold"
          >
            نشطة
          </TabsTrigger>
          <TabsTrigger 
            value="RETURNED"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold"
          >
            مُرجعة
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground font-medium">جاري التحميل...</p>
            </div>
          ) : loans.length === 0 ? (
            <Card className="p-16 text-center shadow-lg border-gray-100">
              <div className="flex flex-col items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">لا توجد إعارات</h3>
                <p className="text-muted-foreground max-w-sm">
                  ابدأ بتصفح مكتبتنا واستعارة الكتب المفضلة لديك
                </p>
                <Link
                  href="/books"
                  className="mt-4 px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md"
                >
                  تصفح الكتب
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loans.map((loan) => (
                <Link key={loan.id} href={`/my-loans/${loan.id}`}>
                  <Card className="p-5 hover:shadow-xl transition-all duration-300 cursor-pointer border-gray-200 hover:border-primary/30 group h-full">
                    <div className="flex gap-4">
                      <div className="w-24 h-32 relative flex-shrink-0 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                        <Image
                          src={loan.book.coverImage || "/placeholder.svg"}
                          alt={loan.book.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h3 className="font-bold text-lg mb-1 line-clamp-2 text-gray-900 group-hover:text-primary transition-colors">
                          {loan.book.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                          {loan.book.author}
                        </p>
                        <div className="space-y-2.5 mt-auto">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">
                              {format(new Date(loan.borrowDate), "d MMM yyyy", {
                                locale: ar,
                              })}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 font-medium">
                            الإرجاع:{" "}
                            <span className={new Date() > new Date(loan.dueDate) && loan.status !== "RETURNED" ? "text-red-600 font-semibold" : ""}>
                              {format(new Date(loan.dueDate), "d MMM yyyy", {
                                locale: ar,
                              })}
                            </span>
                          </div>
                          <EnhancedStatusBadge status={getStatusForLoan(loan)} />
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
  );
}