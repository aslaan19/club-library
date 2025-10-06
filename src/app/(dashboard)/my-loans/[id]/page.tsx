"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { Book, Loan } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Flame,
  Clock,
} from "lucide-react";

type LoanWithBook = Loan & {
  book: Book;
};

type Props = {
  params: Promise<{ id: string }>;
};

const EnhancedStatusBadge = ({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case "borrowed":
        return {
          label: "مُرجعة",
          icon: <CheckCircle2 className="h-5 w-5" />,
          className:
            "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm",
        };
      case "active":
        return {
          label: "نشطة",
          icon: <Flame className="h-5 w-5" />,
          className: "bg-blue-50 text-blue-700 border-blue-200 shadow-sm",
        };
      case "overdue":
        return {
          label: "متأخرة",
          icon: <Clock className="h-5 w-5" />,
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
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${config.className} ${className}`}
    >
      {config.icon}
      {config.label}
    </div>
  );
};

export default function LoanDetailsPage({ params }: Props) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loan, setLoan] = useState<LoanWithBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returnLoading, setReturnLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchLoan = async () => {
      try {
        const response = await fetch(`/api/loans/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error("فشل في تحميل تفاصيل الإعارة");
        }
        const data = await response.json();
        setLoan(data);
      } catch (err) {
        setError("فشل في تحميل تفاصيل الإعارة");
      } finally {
        setLoading(false);
      }
    };

    fetchLoan();
  }, [resolvedParams.id]);

  const handleReturn = async () => {
    if (!loan || returnLoading) return;

    try {
      setReturnLoading(true);
      const response = await fetch(`/api/loans/${loan.id}/return`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("فشل في إرجاع الكتاب");
      }

      const updatedLoan = await response.json();
      setLoan(updatedLoan);
      setShowConfirm(false);

      alert("تم إرجاع الكتاب بنجاح");
    } catch (err) {
      alert("فشل في إرجاع الكتاب. حاول مرة أخرى");
    } finally {
      setReturnLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">جاري التحميل...</p>
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-10 text-center shadow-lg border-red-100">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div className="text-red-700 text-lg mb-6 font-semibold">
            {error || "الإعارة غير موجودة"}
          </div>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="shadow-sm"
          >
            العودة
          </Button>
        </Card>
      </div>
    );
  }

  const isOverdue = new Date() > new Date(loan.dueDate);
  const canReturn = loan.status !== "RETURNED";
  const getStatus = () => {
    if (loan.status === "RETURNED") return "borrowed";
    if (isOverdue) return "overdue";
    return "active";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        onClick={() => router.back()}
        variant="ghost"
        className="mb-6 hover:bg-accent font-medium"
      >
        <ArrowRight className="ml-2 h-4 w-4" />
        العودة إلى إعاراتي
      </Button>

      <Card className="overflow-hidden shadow-xl border-gray-200">
        <div className="bg-gradient-to-l from-primary/5 via-primary/10 to-accent/5 p-8 border-b border-gray-100">
          <h1 className="text-2xl font-bold mb-2 text-gray-900 tracking-tight">
            تفاصيل الإعارة
          </h1>
          <p className="text-muted-foreground text-sm">
            معلومات كاملة عن الكتاب المستعار
          </p>
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-52 h-80 relative flex-shrink-0 rounded-xl overflow-hidden shadow-2xl mx-auto md:mx-0 border border-gray-100">
              <Image
                src={
                  loan.book.coverImage ||
                  "/placeholder.svg?height=320&width=208&query=book"
                }
                alt={loan.book.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-3 text-gray-900 leading-tight">
                  {loan.book.title}
                </h2>
                <p className="text-lg text-muted-foreground mb-4 font-medium">
                  {loan.book.author}
                </p>
                <EnhancedStatusBadge status={getStatus()} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-50/50 border-blue-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-blue-100">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      تاريخ الإستعارة
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {format(new Date(loan.borrowDate), "d MMMM yyyy", {
                      locale: ar,
                    })}
                  </p>
                </Card>

                <Card
                  className={`p-5 shadow-sm ${
                    isOverdue && loan.status !== "RETURNED"
                      ? "bg-gradient-to-br from-red-50 to-red-50/50 border-red-200"
                      : "bg-gradient-to-br from-purple-50 to-purple-50/50 border-purple-100"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isOverdue && loan.status !== "RETURNED"
                          ? "bg-red-100"
                          : "bg-purple-100"
                      }`}
                    >
                      <Calendar
                        className={`h-5 w-5 ${
                          isOverdue && loan.status !== "RETURNED"
                            ? "text-red-600"
                            : "text-purple-600"
                        }`}
                      />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      موعد الإرجاع
                    </span>
                  </div>
                  <p
                    className={`text-lg font-bold ${
                      isOverdue && loan.status !== "RETURNED"
                        ? "text-red-700"
                        : "text-gray-900"
                    }`}
                  >
                    {format(new Date(loan.dueDate), "d MMMM yyyy", {
                      locale: ar,
                    })}
                  </p>
                  {isOverdue && loan.status !== "RETURNED" && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Clock className="h-4 w-4 text-red-600" />
                      <p className="text-sm text-red-600 font-semibold">
                        متأخر عن الموعد!
                      </p>
                    </div>
                  )}
                </Card>

                {loan.returnDate && (
                  <Card className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-50/50 border-emerald-200 shadow-sm sm:col-span-2">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 rounded-xl bg-emerald-100">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <span className="text-sm text-gray-600 font-medium">
                        تاريخ الإرجاع الفعلي
                      </span>
                    </div>
                    <p className="text-lg font-bold text-emerald-700">
                      {format(new Date(loan.returnDate), "d MMMM yyyy", {
                        locale: ar,
                      })}
                    </p>
                  </Card>
                )}
              </div>

              {canReturn && (
                <div className="pt-4">
                  {!showConfirm ? (
                    <Button
                      onClick={() => setShowConfirm(true)}
                      className="w-full text-base py-6 shadow-md font-semibold"
                      size="lg"
                    >
                      <CheckCircle2 className="ml-2 h-5 w-5" />
                      إرجاع الكتاب
                    </Button>
                  ) : (
                    <Card className="p-5 bg-amber-50 border-amber-200 shadow-md">
                      <p className="text-center mb-5 font-semibold text-gray-900">
                        هل أنت متأكد من إرجاع هذا الكتاب؟
                      </p>
                      <div className="flex gap-3">
                        <Button
                          onClick={handleReturn}
                          disabled={returnLoading}
                          className="flex-1 font-semibold shadow-sm"
                        >
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
                          className="flex-1 font-semibold shadow-sm"
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
  );
}
