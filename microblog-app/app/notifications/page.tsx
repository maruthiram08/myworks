"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { formatDate, getAvatarUrl } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function NotificationsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications")
      if (!res.ok) throw new Error("Failed to fetch notifications")
      return res.json()
    },
  })

  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", { method: "PATCH" })
      if (!res.ok) throw new Error("Failed to mark as read")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  const getNotificationText = (notification: any) => {
    switch (notification.type) {
      case "LIKE":
        return "liked your post"
      case "REPLY":
        return "replied to your post"
      case "REPOST":
        return "reposted your post"
      case "FOLLOW":
        return "followed you"
      case "MENTION":
        return "mentioned you in a post"
      default:
        return "interacted with you"
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 p-4 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Notifications</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAsReadMutation.mutate()}
            disabled={markAsReadMutation.isPending}
          >
            Mark all as read
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {isLoading && (
        <div className="p-8 text-center text-gray-500">
          Loading notifications...
        </div>
      )}

      {data?.notifications && data.notifications.length > 0 ? (
        <div>
          {data.notifications.map((notification: any) => (
            <Link
              key={notification.id}
              href={notification.postId ? `/post/${notification.postId}` : `/profile/${notification.sender?.username}`}
              className={`block border-b border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${
                !notification.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
              }`}
            >
              <div className="flex gap-3">
                <img
                  src={getAvatarUrl(notification.sender?.name, notification.sender?.image)}
                  alt={notification.sender?.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <p>
                    <strong className="font-semibold">{notification.sender?.name}</strong>{" "}
                    <span className="text-gray-600 dark:text-gray-400">
                      {getNotificationText(notification)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          No notifications yet
        </div>
      )}
    </div>
  )
}
