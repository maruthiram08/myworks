"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { PostCard } from "@/components/post/post-card"
import { ComposePost } from "@/components/post/compose-post"
import Link from "next/link"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"

export default function PostDetailPage() {
  const params = useParams()
  const postId = params.postId as string

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${postId}`)
      if (!res.ok) throw new Error("Failed to fetch post")
      return res.json()
    },
  })

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 p-4 z-10 flex items-center gap-4">
        <Link href="/">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Post</h1>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="p-8 text-center text-gray-500">Loading post...</div>
      )}

      {error && (
        <div className="p-8 text-center text-red-500">
          Error loading post. Please try again.
        </div>
      )}

      {post && (
        <div>
          <PostCard post={post} showThread={false} />

          {/* Reply form */}
          <div className="border-t border-gray-200 dark:border-gray-800">
            <ComposePost placeholder="Post your reply" replyTo={postId} />
          </div>

          {/* Replies */}
          <div className="border-t border-gray-200 dark:border-gray-800">
            {post.replies && post.replies.length > 0 ? (
              post.replies.map((reply: any) => (
                <div key={reply.id} className="border-b border-gray-200 dark:border-gray-800 p-4">
                  <div className="flex gap-3">
                    <img
                      src={reply.user.image || `https://ui-avatars.com/api/?name=${reply.user.name}`}
                      alt={reply.user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{reply.user.name}</span>
                        <span className="text-gray-500">@{reply.user.username}</span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No replies yet. Be the first to reply!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
