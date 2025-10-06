// src/app/(dashboard)/my-contributions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import Link from "next/link";
import type { Book, Loan, User } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  BookOpen,
  Trash2,
  User as UserIcon,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";

type BookWithLoans = Book & {
  loans: Array<
    Loan & {
      user: Pick<User, "name" | "email">;
    }
  >;
  _count: {
    loans: number;
  };
};

export default function MyContributionsPage() {
  const [books, setBooks] = useState<BookWithLoans[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("غير مصرح");
        return;
      }

      const response = await fetch("/api/my-contributions", {
        headers: {
          "x-user-id": session.user.id,
        },
      });

      if (!response.ok) {
        throw new Error("فشل في تحميل المساهمات");
      }

      const data = await response.json();
      setBooks(data);
    } catch (err) {
      setError("فشل في تحميل المساهمات");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookId: string) => {
    try {
      setDeletingId(bookId);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch(`/api/my-contributions/${bookId}`, {
        method: "DELETE",
        headers: {
          "x-user-id": session.user.id,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      // Remove from local state
      setBooks(books.filter((b) => b.id !== bookId));
    } catch (err: any) {
      alert(err.message || "فشل في حذف الكتاب");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center border-destructive">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <div className="text-destructive text-lg">{error}</div>
        </Card>
      </div>
    );
  }

  const totalBorrowCount = books.reduce(
    (sum, book) => sum + book._count.loans,
    0
  );
  const currentlyBorrowed = books.filter((b) => b.loans.length > 0).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">مساهماتي</h1>
        <p className="text-muted-foreground text-lg">
          الكتب التي ساهمت بها في مكتبة النادي
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">إجمالي الكتب</p>
              <p className="text-3xl font-bold">{books.length}</p>
            </div>
            <BookOpen className="h-12 w-12 text-primary" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                مُستعارة حالياً
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {currentlyBorrowed}
              </p>
            </div>
            <UserIcon className="h-12 w-12 text-blue-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                إجمالي الإعارات
              </p>
              <p className="text-3xl font-bold text-green-600">
                {totalBorrowCount}
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-500" />
          </CardContent>
        </Card>
      </div>

      {/* Books List */}
      {books.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-6 rounded-full bg-muted">
              <BookOpen className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold">لا توجد مساهمات</h3>
            <p className="text-muted-foreground max-w-md">
              لم تقم بإضافة أي كتب بعد. ساهم في إثراء المكتبة بإضافة كتبك!
            </p>
            <Link href="/books/add">
              <Button size="lg" className="mt-4">
                <BookOpen className="ml-2 h-5 w-5" />
                إضافة كتاب
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => {
            const activeLoan = book.loans[0];
            const isCurrentlyBorrowed = book.loans.length > 0;

            return (
              <Card
                key={book.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full bg-muted">
                    {book.coverImage ? (
                      <Image
                        src={book.coverImage}
                        alt={book.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    {isCurrentlyBorrowed && (
                      <Badge className="absolute top-3 right-3 bg-blue-500">
                        مُستعار
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <CardTitle className="text-xl mb-2 line-clamp-2">
                    {book.title}
                  </CardTitle>
                  <CardDescription className="mb-4">
                    {book.author}
                  </CardDescription>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">الفئة:</span>
                      <Badge variant="secondary">{book.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        عدد الإعارات:
                      </span>
                      <span className="font-semibold">{book._count.loans}</span>
                    </div>
                  </div>

                  {/* Current Borrower Info */}
                  {activeLoan && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <UserIcon className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-900">
                            {activeLoan.user.name}
                          </p>
                          <p className="text-xs text-blue-700 truncate">
                            {activeLoan.user.email}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            موعد الإرجاع:{" "}
                            {new Date(activeLoan.dueDate).toLocaleDateString(
                              "ar-EG"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link href={`/books/${book.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        عرض التفاصيل
                      </Button>
                    </Link>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          disabled={
                            isCurrentlyBorrowed || deletingId === book.id
                          }
                        >
                          {deletingId === book.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                          <AlertDialogDescription className="space-y-2">
                            <p>هل أنت متأكد من حذف هذا الكتاب؟</p>
                            <div className="bg-muted p-4 rounded-lg">
                              <p className="font-semibold text-foreground">
                                {book.title}
                              </p>
                              <p className="text-sm">{book.author}</p>
                            </div>
                            <p className="text-destructive text-sm font-medium">
                              لا يمكن التراجع عن هذا الإجراء
                            </p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(book.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {isCurrentlyBorrowed && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      لا يمكن الحذف أثناء الإعارة
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
