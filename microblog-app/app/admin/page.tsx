"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import toast from "react-hot-toast"

export default function AdminPage() {
  const queryClient = useQueryClient()

  const { data: reports, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const res = await fetch("/api/reports")
      if (!res.ok) throw new Error("Failed to fetch reports")
      return res.json()
    },
  })

  const updateReportMutation = useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string; status: string }) => {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Failed to update report")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] })
      toast.success("Report updated")
    },
  })

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 p-4 z-10">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <p className="text-sm text-gray-500">Manage reports and moderation</p>
      </div>

      {/* Reports */}
      {isLoading && (
        <div className="p-8 text-center text-gray-500">Loading reports...</div>
      )}

      {reports?.reports && reports.reports.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {reports.reports.map((report: any) => (
            <div key={report.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-semibold">{report.type} Report</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    report.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : report.status === "RESOLVED"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  }`}>
                    {report.status}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{formatDate(report.createdAt)}</span>
              </div>

              <div className="mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reported by: <strong>{report.reporter.name}</strong> (@{report.reporter.username})
                </p>
                {report.reportedUser && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reported user: <strong>{report.reportedUser.name}</strong> (@{report.reportedUser.username})
                  </p>
                )}
                {report.post && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Post: "{report.post.content.substring(0, 50)}..."
                  </p>
                )}
              </div>

              <div className="mb-3">
                <p className="text-sm">
                  <strong>Reason:</strong> {report.reason}
                </p>
              </div>

              {report.status === "PENDING" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      updateReportMutation.mutate({
                        reportId: report.id,
                        status: "REVIEWING",
                      })
                    }
                  >
                    Review
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() =>
                      updateReportMutation.mutate({
                        reportId: report.id,
                        status: "RESOLVED",
                      })
                    }
                  >
                    Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      updateReportMutation.mutate({
                        reportId: report.id,
                        status: "REJECTED",
                      })
                    }
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">No reports</div>
      )}
    </div>
  )
}
