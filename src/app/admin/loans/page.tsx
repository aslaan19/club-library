"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

type LoanWithDetails = {
  id: string;
  status: "ACTIVE" | "RETURNED";
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  user: {
    email: string;
  };
  book: {
    title: string;
    author: string;
  };
};

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<LoanWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "ALL" | "ACTIVE" | "OVERDUE" | "RETURNED"
  >("ALL");

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await fetch(`/api/admin/loans?status=${filter}`);
        if (!response.ok) throw new Error("Failed to fetch loans");
        const data = await response.json();
        setLoans(data);
      } catch (error) {
        console.error("Failed to fetch loans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, [filter]);

  const handleReturn = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/loans/${id}/return`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to return loan");

      // Update the loan in the list
      const updatedLoan = await response.json();
      setLoans(loans.map((loan) => (loan.id === id ? updatedLoan : loan)));
    } catch (error) {
      console.error("Failed to return loan:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Loans</h1>
        <div className="space-x-2">
          {(["ALL", "ACTIVE", "OVERDUE", "RETURNED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded ${
                filter === status
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Book
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Borrow Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loans.map((loan) => {
              const isOverdue =
                new Date() > new Date(loan.dueDate) && loan.status === "ACTIVE";

              return (
                <tr key={loan.id}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{loan.book.title}</div>
                      <div className="text-sm text-gray-500">
                        {loan.book.author}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {loan.user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(loan.borrowDate), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={isOverdue ? "text-red-600" : ""}>
                      {format(new Date(loan.dueDate), "MMM d, yyyy")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        loan.status === "RETURNED"
                          ? "bg-green-100 text-green-800"
                          : isOverdue
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {loan.status === "RETURNED"
                        ? "Returned"
                        : isOverdue
                        ? "Overdue"
                        : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {loan.status === "ACTIVE" && (
                      <button
                        onClick={() => handleReturn(loan.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Return
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
