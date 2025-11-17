"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import axios from "axios"
import Link from "next/link"
import { pusherClient } from "@/lib/pusher"
import { useSession } from "next-auth/react"
import { formatDate } from "@/lib/utils"
import { Heart, Repeat2, MessageCircle, UserPlus, Loader2, User } from "lucide-react"

export default function NotificationsPage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await axios.get("/api/notifications")
      return data
    },
  })

  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      await axios.patch("/api/notifications")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  useEffect(() => {
    if (session?.user?.id) {
      const channel = pusherClient.subscribe(`user-${session.user.id}`)

      channel.bind("notification", () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] })
      })

      return () => {
        channel.unbind_all()
        channel.unsubscribe()
      }
    }
  }, [session?.user?.id, queryClient])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (notifications?.some((n: any) => !n.read)) {
        markAsReadMutation.mutate()
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [notifications])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "LIKE":
        return <Heart className="h-6 w-6 text-red-500 fill-current" />
      case "REPOST":
        return <Repeat2 className="h-6 w-6 text-green-500" />
      case "REPLY":
        return <MessageCircle className="h-6 w-6 text-blue-500" />
      case "FOLLOW":
        return <UserPlus className="h-6 w-6 text-primary" />
      default:
        return null
    }
  }

  const getNotificationText = (notification: any) => {
    switch (notification.type) {
      case "LIKE":
        return "liked your post"
      case "REPOST":
        return "reposted your post"
      case "REPLY":
        return "replied to your post"
      case "FOLLOW":
        return "followed you"
      default:
        return ""
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <h1 className="p-4 text-xl font-bold">Notifications</h1>
      </div>

      {notifications && notifications.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No notifications yet
        </div>
      ) : (
        <div>
          {notifications?.map((notification: any) => (
            <Link
              key={notification.id}
              href={
                notification.postId
                  ? `/post/${notification.postId}`
                  : `/profile/${notification.senderId}`
              }
              className={`block border-b border-border p-4 hover:bg-accent/50 transition-colors ${
                !notification.read ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {notification.sender?.image ? (
                        <img
                          src={notification.sender.image}
                          alt={notification.sender.name || "User"}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">
                          {notification.sender?.name}
                        </span>{" "}
                        {getNotificationText(notification)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
