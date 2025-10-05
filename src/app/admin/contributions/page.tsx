"use client";

import { useEffect, useState } from "react";

type Contribution = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: {
    email: string;
  };
  book: {
    title: string;
    author: string;
  };
};

export default function AdminContributionsPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("ALL");

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const response = await fetch(
          `/api/admin/contributions?status=${filter}`
        );
        if (!response.ok) throw new Error("Failed to fetch contributions");
        const data = await response.json();
        setContributions(data.contributions || []);
      } catch (error) {
        console.error("Failed to fetch contributions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [filter]);

  const handleStatusUpdate = async (
    id: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      const response = await fetch(`/api/admin/contributions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update contribution status");

      // Update the contribution in the list
      const updatedContribution = await response.json();
      setContributions(
        contributions.map((contribution) =>
          contribution.id === id ? updatedContribution : contribution
        )
      );
    } catch (error) {
      console.error("Failed to update contribution status:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Contributions</h1>
        <div className="space-x-2">
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map(
            (status) => (
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
            )
          )}
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
                Contributor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
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
            {contributions.map((contribution) => (
              <tr key={contribution.id}>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium">{contribution.book.title}</div>
                    <div className="text-sm text-gray-500">
                      {contribution.book.author}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {contribution.user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(contribution.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      contribution.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : contribution.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {contribution.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {contribution.status === "PENDING" && (
                    <div className="space-x-2">
                      <button
                        onClick={() =>
                          handleStatusUpdate(contribution.id, "APPROVED")
                        }
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(contribution.id, "REJECTED")
                        }
                        className="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
