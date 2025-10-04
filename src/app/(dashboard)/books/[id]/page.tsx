// src/app/(dashboard)/books/[id]/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  if (loading) return <p className="text-center p-8">جاري التحميل...</p>;

  if (!book) return <p className="text-center p-8">الكتاب غير موجود</p>;

  const isAvailable = book.status === "AVAILABLE" && book.loans.length === 0;
  const activeLoan = book.loans.find((loan) => loan.status === "ACTIVE");

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Link href="/books" className="text-blue-600 hover:underline mb-4 block">
        ← العودة للمكتبة
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">لا توجد صورة</span>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-4">{book.title}</h1>
          <p className="text-xl text-gray-600 mb-4">{book.author}</p>
          <p className="text-sm text-gray-500 mb-6">{book.category}</p>

          {book.description && (
            <p className="text-gray-700 mb-6">{book.description}</p>
          )}

          {book.contributor && (
            <p className="text-sm text-gray-500 mb-6">
              تطوع به:{" "}
              <span className="font-semibold">{book.contributor.name}</span>
            </p>
          )}

          <div className="mb-6">
            {isAvailable ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                ✅ الكتاب متاح للاستعارة
              </div>
            ) : (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                ❌ الكتاب مستعار حاليًا
                {activeLoan && (
                  <p className="text-sm mt-2">
                    المستعير: {activeLoan.user.name}
                    <br />
                    موعد الإرجاع:{" "}
                    {new Date(activeLoan.dueDate).toLocaleDateString("ar-EG")}
                  </p>
                )}
              </div>
            )}
          </div>

          {isAvailable && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold mb-4">استعارة الكتاب</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  عدد الأيام (الحد الأقصى 14 يوم):
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="border px-4 py-2 rounded w-full"
                />
                <p className="text-sm text-gray-500 mt-2">
                  موعد الإرجاع:{" "}
                  {new Date(
                    Date.now() + days * 24 * 60 * 60 * 1000
                  ).toLocaleDateString("ar-EG")}
                </p>
              </div>
              <button
                onClick={handleBorrow}
                disabled={borrowing}
                className="w-full bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 disabled:bg-gray-400"
              >
                {borrowing ? "جاري الاستعارة..." : "استعارة الآن"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
