"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { PostCard } from "@/components/post/post-card"
import { Button } from "@/components/ui/button"
import { formatNumber, getAvatarUrl } from "@/lib/utils"
import toast from "react-hot-toast"
import Link from "next/link"
import { ArrowLeftIcon, CalendarIcon, LinkIcon, MapPinIcon } from "@heroicons/react/24/outline"

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<"posts" | "replies">("posts")

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", username],
    queryFn: async () => {
      // In a real app, you'd have an endpoint to get user by username
      const res = await fetch(`/api/users/${username}`)
      if (!res.ok) throw new Error("Failed to fetch user")
      return res.json()
    },
  })

  const { data: posts } = useQuery({
    queryKey: ["user-posts", username],
    queryFn: async () => {
      const res = await fetch(`/api/posts?userId=${user.id}`)
      if (!res.ok) throw new Error("Failed to fetch posts")
      return res.json()
    },
    enabled: !!user,
  })

  const followMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/users/${user.id}/follow`, {
        method: user.isFollowing ? "DELETE" : "POST",
      })
      if (!res.ok) throw new Error("Failed to follow user")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", username] })
      toast.success(user.isFollowing ? "Unfollowed" : "Following!")
    },
  })

  const isOwnProfile = session?.user?.id === user?.id

  if (isLoading) {
    return <div className="p-8 text-center">Loading profile...</div>
  }

  if (!user) {
    return <div className="p-8 text-center">User not found</div>
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 p-4 z-10 flex items-center gap-4">
        <Link href="/">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">{user.name}</h1>
          <p className="text-sm text-gray-500">{formatNumber(user._count?.posts || 0)} posts</p>
        </div>
      </div>

      {/* Profile */}
      <div>
        {/* Cover image */}
        <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500"></div>

        <div className="px-4">
          {/* Avatar */}
          <div className="flex justify-between items-start -mt-16 mb-4">
            <img
              src={getAvatarUrl(user.name, user.image)}
              alt={user.name}
              className="w-32 h-32 rounded-full border-4 border-white dark:border-black"
            />
            {isOwnProfile ? (
              <Button variant="secondary" className="mt-20">Edit profile</Button>
            ) : (
              <Button
                variant={user.isFollowing ? "secondary" : "primary"}
                className="mt-20"
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
              >
                {user.isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </div>

          {/* Info */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-500">@{user.username || user.id}</p>

            {user.bio && <p className="mt-3">{user.bio}</p>}

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4" />
                  {user.location}
                </div>
              )}
              {user.website && (
                <div className="flex items-center gap-1">
                  <LinkIcon className="h-4 w-4" />
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {user.website}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>

            <div className="flex gap-4 mt-3">
              <div>
                <strong className="font-semibold">{formatNumber(user._count?.following || 0)}</strong>
                <span className="text-gray-500 ml-1">Following</span>
              </div>
              <div>
                <strong className="font-semibold">{formatNumber(user._count?.followers || 0)}</strong>
                <span className="text-gray-500 ml-1">Followers</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-800 flex">
            <button
              className={`flex-1 py-4 font-semibold ${
                tab === "posts"
                  ? "border-b-2 border-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setTab("posts")}
            >
              Posts
            </button>
            <button
              className={`flex-1 py-4 font-semibold ${
                tab === "replies"
                  ? "border-b-2 border-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setTab("replies")}
            >
              Replies
            </button>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div>
        {posts?.posts.map((post: any) => (
          <PostCard key={post.id} post={post} />
        ))}
        {posts?.posts.length === 0 && (
          <div className="p-8 text-center text-gray-500">No posts yet</div>
        )}
      </div>
    </div>
  )
}
