"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

type ReportData = {
  totalBooks: number;
  totalUsers: number;
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  mostBorrowedBooks: {
    title: string;
    author: string;
    borrowCount: number;
  }[];
  recentActivities: {
    type: "LOAN" | "RETURN" | "CONTRIBUTION";
    date: string;
    details: string;
  }[];
};

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">(
    "month"
  );

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(
          `/api/admin/reports?timeframe=${timeframe}`
        );
        if (!response.ok) throw new Error("Failed to fetch reports");
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [timeframe]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Failed to load reports</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <div className="space-x-2">
          {(["week", "month", "year"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 rounded ${
                timeframe === t
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Past {t}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Total Books", value: data.totalBooks },
          { label: "Active Loans", value: data.activeLoans },
          { label: "Overdue Loans", value: data.overdueLoans },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm">{stat.label}</h3>
            <p className="text-3xl font-semibold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Most Borrowed Books */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Most Borrowed Books</h2>
          <div className="space-y-4">
            {data.mostBorrowedBooks.map((book, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{book.title}</p>
                  <p className="text-sm text-gray-500">{book.author}</p>
                </div>
                <div className="text-blue-600 font-semibold">
                  {book.borrowCount} borrows
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {data.recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-3 ${
                    activity.type === "LOAN"
                      ? "bg-blue-500"
                      : activity.type === "RETURN"
                      ? "bg-green-500"
                      : "bg-purple-500"
                  }`}
                />
                <div className="flex-1">
                  <p>{activity.details}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(activity.date), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
