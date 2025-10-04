"use client";

import { useEffect, useState } from "react";

type Stats = {
  totalBooks: number;
  totalUsers: number;
  activeLoans: number;
  overdueLoans: number;
  pendingContributions: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [booksRes, usersRes, loansRes, contributionsRes] =
          await Promise.all([
            fetch("/api/admin/books/stats"),
            fetch("/api/admin/users/stats"),
            fetch("/api/admin/loans/stats"),
            fetch("/api/admin/contributions/stats"),
          ]);

        const [books, users, loans, contributions] = await Promise.all([
          booksRes.json(),
          usersRes.json(),
          loansRes.json(),
          contributionsRes.json(),
        ]);

        setStats({
          totalBooks: books.total,
          totalUsers: users.total,
          activeLoans: loans.active,
          overdueLoans: loans.overdue,
          pendingContributions: contributions.pending,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!stats) {
    return <div>Failed to load statistics</div>;
  }

  const statCards = [
    { label: "Total Books", value: stats.totalBooks },
    { label: "Total Users", value: stats.totalUsers },
    { label: "Active Loans", value: stats.activeLoans },
    { label: "Overdue Loans", value: stats.overdueLoans },
    { label: "Pending Contributions", value: stats.pendingContributions },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm">{stat.label}</h3>
            <p className="text-3xl font-semibold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
