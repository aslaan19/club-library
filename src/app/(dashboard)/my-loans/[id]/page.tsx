"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { Book, Loan } from "@prisma/client";

type LoanWithBook = Loan & {
  book: Book;
};

type Props = {
  params: Promise<{ id: string }>;
};

export default function LoanDetailsPage({ params }: Props) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loan, setLoan] = useState<LoanWithBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    const fetchLoan = async () => {
      try {
        const response = await fetch(`/api/loans/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch loan details");
        }
        const data = await response.json();
        setLoan(data);
      } catch (err) {
        setError("Failed to load loan details");
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
        throw new Error("Failed to return book");
      }

      // Refresh the loan data
      const updatedLoan = await response.json();
      setLoan(updatedLoan);
    } catch (err) {
      setError("Failed to return book");
    } finally {
      setReturnLoading(false);
    }
  };

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

  if (!loan) {
    return <div className="text-center">Loan not found</div>;
  }

  const isOverdue = new Date() > new Date(loan.dueDate);
  const canReturn = loan.status !== "RETURNED";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 text-blue-600 hover:underline flex items-center"
        >
          ← Back to My Loans
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex gap-6">
              <div className="w-32 h-48 relative flex-shrink-0">
                <Image
                  src={loan.book.coverImage || "/book-placeholder.jpg"}
                  alt={loan.book.title}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{loan.book.title}</h1>
                <p className="text-gray-600 mb-4">{loan.book.author}</p>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Borrowed Date:</span>
                    <span>
                      {format(new Date(loan.borrowDate), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className={isOverdue ? "text-red-600" : ""}>
                      {format(new Date(loan.dueDate), "MMM d, yyyy")}
                    </span>
                  </div>
                  {loan.returnDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Return Date:</span>
                      <span>
                        {format(new Date(loan.returnDate), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`font-medium ${
                        loan.status === "RETURNED"
                          ? "text-green-600"
                          : isOverdue
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    >
                      {loan.status === "RETURNED"
                        ? "Returned"
                        : isOverdue
                        ? "Overdue"
                        : "Active"}
                    </span>
                  </div>
                </div>

                {canReturn && (
                  <button
                    onClick={handleReturn}
                    disabled={returnLoading}
                    className={`mt-6 w-full py-2 px-4 rounded ${
                      returnLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white font-medium transition-colors`}
                  >
                    {returnLoading ? "Returning..." : "Return Book"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
