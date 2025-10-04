"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Book, Loan } from "@prisma/client";

type LoanWithBook = Loan & {
  book: Book;
};

export default function MyLoansPage() {
  const [loans, setLoans] = useState<LoanWithBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "RETURNED">("ALL");

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const status = filter === "ALL" ? "" : filter;
        const response = await fetch(
          `/api/loans${status ? `?status=${status}` : ""}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch loans");
        }
        const data = await response.json();
        setLoans(data);
      } catch (err) {
        setError("Failed to load loans");
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, [filter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Loans</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded ${
              filter === "ALL" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("ACTIVE")}
            className={`px-4 py-2 rounded ${
              filter === "ACTIVE" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("RETURNED")}
            className={`px-4 py-2 rounded ${
              filter === "RETURNED" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Returned
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loans.map((loan) => (
          <Link
            href={`/my-loans/${loan.id}`}
            key={loan.id}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex gap-4">
              <div className="w-24 h-32 relative">
                <Image
                  src={loan.book.coverImage || "/book-placeholder.jpg"}
                  alt={loan.book.title}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{loan.book.title}</h3>
                <p className="text-sm text-gray-600">{loan.book.author}</p>
                <div className="mt-2 text-sm">
                  <p>
                    Borrowed: {format(new Date(loan.borrowDate), "MMM d, yyyy")}
                  </p>
                  <p>Due: {format(new Date(loan.dueDate), "MMM d, yyyy")}</p>
                  <p
                    className={`mt-1 font-medium ${
                      loan.status === "RETURNED"
                        ? "text-green-600"
                        : new Date() > new Date(loan.dueDate)
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {loan.status === "RETURNED"
                      ? "Returned"
                      : new Date() > new Date(loan.dueDate)
                      ? "Overdue"
                      : "Active"}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {loans.length === 0 && (
        <div className="text-center text-gray-500 mt-8">No loans found</div>
      )}
    </div>
  );
}
