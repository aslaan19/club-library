"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Calendar, User, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  category: string;
  coverImage: string | null;
  status: string;
  contributor: { name: string } | null;
  loans: Array<{
    id: string;
    status: string;
    dueDate: string;
    user: { name: string };
  }>;
}

export default function BookDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [days, setDays] = useState(7);
  const router = useRouter();

  useEffect(() => {
    fetchBook();
  }, [resolvedParams.id]);

  const fetchBook = async () => {
    const res = await fetch(`/api/books/${resolvedParams.id}`);
    if (res.ok) {
      const data = await res.json();
      setBook(data);
    }
    setLoading(false);
  };

  const handleBorrow = async () => {
    if (days > 14) {
      alert("الحد الأقصى للاستعارة هو 14 يوم");
      return;
    }

    setBorrowing(true);
    const res = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookId: resolvedParams.id,
        days,
      }),
    });

    if (res.ok) {
      alert("تمت الاستعارة بنجاح!");
      router.push("/my-loans");
    } else {
      const error = await res.json();
      alert(error.error || "حدث خطأ");
    }
    setBorrowing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>الكتاب غير موجود</CardTitle>
            <CardDescription>
              لم نتمكن من العثور على الكتاب المطلوب
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/books">العودة للمكتبة</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Safe to access book properties here - book is guaranteed to exist
  const isAvailable =
    book.status === "AVAILABLE" && (!book.loans || book.loans.length === 0);
  const activeLoan = book.loans?.find((loan) => loan.status === "ACTIVE");
  const dueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in duration-500">
      <Button variant="ghost" asChild className="mb-6 -mr-4">
        <Link href="/books" className="gap-2">
          <ArrowRight className="h-4 w-4" />
          العودة للمكتبة
        </Link>
      </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-0">
              {book.coverImage ? (
                <img
                  src={book.coverImage || "/placeholder.svg"}
                  alt={book.title}
                  className="w-full h-auto object-cover aspect-[3/4]"
                />
              ) : (
                <div className="w-full aspect-[3/4] bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center gap-4">
                  <BookOpen className="h-24 w-24 text-muted-foreground/30" />
                  <span className="text-muted-foreground">لا توجد صورة</span>
                </div>
              )}
            </CardContent>
          </Card>

          {book.contributor && (
            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="flex items-center gap-3 p-4">
                <User className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">تطوع به</p>
                  <p className="font-semibold">{book.contributor.name}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-balance">
                {book.title}
              </h1>
              <StatusBadge status={isAvailable ? "available" : "borrowed"} />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-lg">{book.author}</span>
              </div>
              <Badge variant="secondary" className="text-sm">
                {book.category}
              </Badge>
            </div>

            {book.description && (
              <Card className="bg-muted/30">
                <CardContent className="p-6">
                  <p className="text-foreground/80 leading-relaxed">
                    {book.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <Card
            className={
              isAvailable
                ? "border-success bg-success/5"
                : "border-destructive bg-destructive/5"
            }
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`rounded-full p-2 ${
                    isAvailable ? "bg-success/10" : "bg-destructive/10"
                  }`}
                >
                  {isAvailable ? (
                    <BookOpen className="h-5 w-5 text-success" />
                  ) : (
                    <Clock className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-semibold mb-1 ${
                      isAvailable ? "text-success" : "text-destructive"
                    }`}
                  >
                    {isAvailable
                      ? "الكتاب متاح للاستعارة"
                      : "الكتاب مستعار حاليًا"}
                  </h3>
                  {activeLoan && (
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <p>
                        المستعير:{" "}
                        <span className="font-medium text-foreground">
                          {activeLoan.user.name}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        موعد الإرجاع:{" "}
                        {new Date(activeLoan.dueDate).toLocaleDateString(
                          "ar-EG"
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {isAvailable && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  استعارة الكتاب
                </CardTitle>
                <CardDescription>
                  يمكنك استعارة الكتاب لمدة تصل إلى 14 يومًا
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="days" className="text-base">
                    عدد الأيام
                  </Label>
                  <Input
                    id="days"
                    type="number"
                    min="1"
                    max="14"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="text-lg h-12"
                  />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <Calendar className="h-4 w-4" />
                    <span>
                      موعد الإرجاع:{" "}
                      <span className="font-semibold text-foreground">
                        {dueDate.toLocaleDateString("ar-EG")}
                      </span>
                    </span>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="lg"
                      className="w-full"
                      disabled={borrowing || days > 14 || days < 1}
                    >
                      {borrowing ? "جاري الاستعارة..." : "استعارة الآن"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>تأكيد الاستعارة</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>هل أنت متأكد من استعارة هذا الكتاب؟</p>
                        <div className="bg-muted p-4 rounded-lg space-y-2 text-foreground">
                          <p>
                            <strong>الكتاب:</strong> {book.title}
                          </p>
                          <p>
                            <strong>المدة:</strong> {days} يوم
                          </p>
                          <p>
                            <strong>موعد الإرجاع:</strong>{" "}
                            {dueDate.toLocaleDateString("ar-EG")}
                          </p>
                        </div>
                        <p className="text-destructive text-sm">
                          يرجى الالتزام بموعد الإرجاع
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBorrow}>
                        تأكيد الاستعارة
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
