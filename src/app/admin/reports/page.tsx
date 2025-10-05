"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import Link from "next/link";

type ReportData = {
  totalBooks: number;
  totalUsers: number;
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  returnedLoans: number;
  mostBorrowedBooks: {
    id: string;
    title: string;
    author: string;
    borrowCount: number;
  }[];
  topContributors: {
    id: string;
    name: string;
    contributionCount: number;
  }[];
  recentActivities: {
    type: "LOAN" | "RETURN" | "CONTRIBUTION";
    date: string;
    details: string;
    userName: string;
    bookTitle?: string;
  }[];
};

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">(
    "month"
  );
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [timeframe]);

  const fetchReports = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/reports?timeframe=${timeframe}`);
      if (!response.ok) throw new Error("فشل في تحميل التقارير");
      const reportData = await response.json();
      setData(reportData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async (reportType: string) => {
    setExporting(true);
    try {
      const response = await fetch(
        `/api/admin/reports/export?type=${reportType}&timeframe=${timeframe}`
      );
      if (!response.ok) throw new Error("فشل في التصدير");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}-${timeframe}-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert("✅ تم التصدير بنجاح!");
    } catch (err: any) {
      alert("❌ " + err.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border-r-4 border-red-500 text-red-800 p-6 rounded-lg">
          ❌ {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">لا توجد بيانات</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-l from-waaeen-red to-waaeen-black text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-2xl font-bold hover:opacity-80">
              مكتبة وعيّن
            </Link>
            <span className="text-red-200">|</span>
            <span className="text-lg">لوحة الأدمن</span>
          </div>
          <Link href="/admin" className="hover:underline">
            ← العودة للوحة التحكم
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              📊 التقارير والإحصائيات
            </h1>
            <p className="text-gray-600">تحليل شامل لنشاط المكتبة والطلاب</p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex gap-2">
            {[
              { value: "week", label: "أسبوع" },
              { value: "month", label: "شهر" },
              { value: "year", label: "سنة" },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setTimeframe(t.value as any)}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  timeframe === t.value
                    ? "bg-gradient-to-l from-waaeen-red to-waaeen-red-dark text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                آخر {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "إجمالي الكتب",
              value: data.totalBooks,
              icon: "📚",
              color: "border-blue-500",
              bg: "bg-blue-50",
            },
            {
              label: "الاستعارات النشطة",
              value: data.activeLoans,
              icon: "📖",
              color: "border-green-500",
              bg: "bg-green-50",
            },
            {
              label: "الاستعارات المتأخرة",
              value: data.overdueLoans,
              icon: "⚠️",
              color: "border-red-500",
              bg: "bg-red-50",
            },
            {
              label: "إجمالي الطلاب",
              value: data.totalUsers,
              icon: "👥",
              color: "border-purple-500",
              bg: "bg-purple-50",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`bg-white rounded-xl shadow-lg p-6 border-r-4 ${stat.color} hover:shadow-2xl transition-all`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-600 text-sm font-bold mb-1">
                    {stat.label}
                  </h3>
                  <p className="text-4xl font-bold text-gray-800">
                    {stat.value}
                  </p>
                </div>
                <div className={`text-5xl ${stat.bg} p-3 rounded-xl`}>
                  {stat.icon}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${stat.color.replace(
                    "border-",
                    "bg-"
                  )}`}
                  style={{
                    width: `${Math.min((stat.value / 100) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Most Borrowed Books */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-l from-waaeen-red to-waaeen-red-dark text-white p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">📚 أكثر الكتب استعارة</h2>
                <button
                  onClick={() => exportToCSV("most-borrowed")}
                  disabled={exporting}
                  className="bg-white text-waaeen-red px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-all disabled:opacity-50"
                >
                  {exporting ? "..." : "📥 تصدير"}
                </button>
              </div>
            </div>
            <div className="p-6">
              {data.mostBorrowedBooks.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  لا توجد بيانات متاحة
                </p>
              ) : (
                <div className="space-y-4">
                  {data.mostBorrowedBooks.map((book, index) => (
                    <div
                      key={book.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0
                              ? "bg-yellow-500"
                              : index === 1
                              ? "bg-gray-400"
                              : index === 2
                              ? "bg-orange-600"
                              : "bg-gray-300"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <Link
                            href={`/books/${book.id}`}
                            className="font-bold text-gray-800 hover:text-waaeen-red"
                          >
                            {book.title}
                          </Link>
                          <p className="text-sm text-gray-600">{book.author}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="bg-waaeen-red text-white px-4 py-2 rounded-full font-bold text-sm">
                          {book.borrowCount} مرة
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Contributors */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-l from-green-600 to-green-700 text-white p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">🎁 أكثر المتطوعين نشاطًا</h2>
                <button
                  onClick={() => exportToCSV("top-contributors")}
                  disabled={exporting}
                  className="bg-white text-green-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-all disabled:opacity-50"
                >
                  {exporting ? "..." : "📥 تصدير"}
                </button>
              </div>
            </div>
            <div className="p-6">
              {data.topContributors && data.topContributors.length > 0 ? (
                <div className="space-y-4">
                  {data.topContributors.map((contributor, index) => (
                    <div
                      key={contributor.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <Link
                            href={`/admin/users/${contributor.id}`}
                            className="font-bold text-gray-800 hover:text-green-600"
                          >
                            {contributor.name}
                          </Link>
                        </div>
                      </div>
                      <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold text-sm">
                        {contributor.contributionCount} كتاب
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  لا يوجد متطوعون حاليًا
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-l from-waaeen-black to-waaeen-black-light text-white p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">📋 النشاطات الأخيرة</h2>
              <button
                onClick={() => exportToCSV("activities")}
                disabled={exporting}
                className="bg-white text-waaeen-black px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                {exporting ? "..." : "📥 تصدير"}
              </button>
            </div>
          </div>
          <div className="p-6">
            {data.recentActivities.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                لا توجد نشاطات حديثة
              </p>
            ) : (
              <div className="space-y-4">
                {data.recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    <div
                      className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                        activity.type === "LOAN"
                          ? "bg-blue-500"
                          : activity.type === "RETURN"
                          ? "bg-green-500"
                          : "bg-purple-500"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-gray-800">
                            {activity.details}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.userName}
                            {activity.bookTitle && ` - ${activity.bookTitle}`}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                            activity.type === "LOAN"
                              ? "bg-blue-100 text-blue-800"
                              : activity.type === "RETURN"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {activity.type === "LOAN"
                            ? "استعارة"
                            : activity.type === "RETURN"
                            ? "إرجاع"
                            : "تطوع"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {format(
                          new Date(activity.date),
                          "dd MMMM yyyy - h:mm a",
                          {
                            locale: ar,
                          }
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Export All Section */}
        <div className="mt-8 bg-gradient-to-l from-waaeen-red to-waaeen-black rounded-xl shadow-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">📦 تصدير التقارير الشاملة</h3>
          <p className="mb-6 text-red-100">
            احصل على تقارير كاملة بصيغة CSV لكل البيانات
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => exportToCSV("all-books")}
              disabled={exporting}
              className="bg-white text-waaeen-red px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              📚 جميع الكتب
            </button>
            <button
              onClick={() => exportToCSV("all-loans")}
              disabled={exporting}
              className="bg-white text-waaeen-red px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              📖 جميع الاستعارات
            </button>
            <button
              onClick={() => exportToCSV("all-users")}
              disabled={exporting}
              className="bg-white text-waaeen-red px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              👥 جميع الطلاب
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
