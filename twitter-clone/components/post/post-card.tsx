"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import Link from "next/link"
import { formatDate, formatNumber } from "@/lib/utils"
import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share,
  MoreHorizontal,
  Trash,
  Flag,
} from "lucide-react"

interface Post {
  id: string
  content: string
  imageUrl?: string | null
  gifUrl?: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
  likes?: any[]
  reposts?: any[]
  bookmarks?: any[]
  _count: {
    likes: number
    replies: number
    reposts: number
  }
}

export default function PostCard({ post }: { post: Post }) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [showMenu, setShowMenu] = useState(false)

  const isLiked = post.likes && post.likes.length > 0
  const isReposted = post.reposts && post.reposts.length > 0
  const isBookmarked = post.bookmarks && post.bookmarks.length > 0

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await axios.delete(`/api/posts/${post.id}/like`)
      } else {
        await axios.post(`/api/posts/${post.id}/like`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["post", post.id] })
    },
  })

  const repostMutation = useMutation({
    mutationFn: async () => {
      if (isReposted) {
        await axios.delete(`/api/posts/${post.id}/repost`)
      } else {
        await axios.post(`/api/posts/${post.id}/repost`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["post", post.id] })
    },
  })

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        await axios.delete(`/api/posts/${post.id}/bookmark`)
      } else {
        await axios.post(`/api/posts/${post.id}/bookmark`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/posts/${post.id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })

  const reportMutation = useMutation({
    mutationFn: async () => {
      await axios.post("/api/reports", {
        type: "POST",
        postId: post.id,
        reason: "Inappropriate content",
      })
    },
  })

  return (
    <article className="border-b border-border p-4 hover:bg-accent/50 transition-colors">
      <div className="flex space-x-3">
        <Link href={`/profile/${post.user.id}`}>
          <div className="h-12 w-12 flex-shrink-0 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {post.user.image ? (
              <img
                src={post.user.image}
                alt={post.user.name || "User"}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold">
                {post.user.name?.[0] || "U"}
              </span>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Link
                href={`/profile/${post.user.id}`}
                className="font-semibold hover:underline"
              >
                {post.user.name}
              </Link>
              <Link
                href={`/profile/${post.user.id}`}
                className="text-muted-foreground"
              >
                @{post.user.username}
              </Link>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">
                {formatDate(post.createdAt)}
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="rounded-full p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-card border border-border shadow-lg z-10">
                  {session?.user?.id === post.user.id ? (
                    <button
                      onClick={() => {
                        deleteMutation.mutate()
                        setShowMenu(false)
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        reportMutation.mutate()
                        setShowMenu(false)
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm hover:bg-accent"
                    >
                      <Flag className="mr-2 h-4 w-4" />
                      Report
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <Link href={`/post/${post.id}`}>
            <p className="mt-2 whitespace-pre-wrap break-words">{post.content}</p>

            {post.imageUrl && (
              <div className="mt-3 rounded-2xl overflow-hidden border border-border">
                <img
                  src={post.imageUrl}
                  alt="Post image"
                  className="w-full object-cover max-h-96"
                />
              </div>
            )}

            {post.gifUrl && (
              <div className="mt-3 rounded-2xl overflow-hidden border border-border">
                <img
                  src={post.gifUrl}
                  alt="Post GIF"
                  className="w-full object-cover max-h-96"
                />
              </div>
            )}
          </Link>

          <div className="mt-3 flex items-center justify-between max-w-md">
            <Link
              href={`/post/${post.id}`}
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary group"
            >
              <div className="rounded-full p-2 group-hover:bg-primary/10">
                <MessageCircle className="h-5 w-5" />
              </div>
              <span className="text-sm">
                {formatNumber(post._count.replies)}
              </span>
            </Link>

            <button
              onClick={() => repostMutation.mutate()}
              className={`flex items-center space-x-2 group ${
                isReposted ? "text-green-500" : "text-muted-foreground hover:text-green-500"
              }`}
              disabled={repostMutation.isPending}
            >
              <div className="rounded-full p-2 group-hover:bg-green-500/10">
                <Repeat2 className="h-5 w-5" />
              </div>
              <span className="text-sm">
                {formatNumber(post._count.reposts)}
              </span>
            </button>

            <button
              onClick={() => likeMutation.mutate()}
              className={`flex items-center space-x-2 group ${
                isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
              }`}
              disabled={likeMutation.isPending}
            >
              <div className="rounded-full p-2 group-hover:bg-red-500/10">
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
              </div>
              <span className="text-sm">{formatNumber(post._count.likes)}</span>
            </button>

            <button
              onClick={() => bookmarkMutation.mutate()}
              className={`flex items-center space-x-2 group ${
                isBookmarked ? "text-primary" : "text-muted-foreground hover:text-primary"
              }`}
              disabled={bookmarkMutation.isPending}
            >
              <div className="rounded-full p-2 group-hover:bg-primary/10">
                <Bookmark
                  className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`}
                />
              </div>
            </button>

            <button className="flex items-center space-x-2 text-muted-foreground hover:text-primary group">
              <div className="rounded-full p-2 group-hover:bg-primary/10">
                <Share className="h-5 w-5" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
