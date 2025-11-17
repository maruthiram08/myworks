"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import axios from "axios"
import { useParams } from "next/navigation"
import Feed from "@/components/feed/feed"
import { Calendar, MapPin, Link as LinkIcon, User, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function ProfilePage() {
  const params = useParams()
  const userId = params.userId as string
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/users/${userId}`)
      return data
    },
  })

  const followMutation = useMutation({
    mutationFn: async () => {
      if (user?.isFollowing) {
        await axios.delete(`/api/users/${userId}/follow`)
      } else {
        await axios.post(`/api/users/${userId}/follow`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        User not found
      </div>
    )
  }

  const isOwnProfile = session?.user?.id === userId

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border-b border-border">
        <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/10"></div>

        <div className="px-4 pb-4">
          <div className="flex justify-between items-start -mt-16 mb-4">
            <div className="h-32 w-32 rounded-full border-4 border-background bg-muted flex items-center justify-center overflow-hidden">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="h-32 w-32 rounded-full object-cover"
                />
              ) : (
                <User className="h-16 w-16 text-muted-foreground" />
              )}
            </div>

            {!isOwnProfile && (
              <button
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
                className={`mt-3 rounded-full px-4 py-2 font-semibold ${
                  user.isFollowing
                    ? "border border-border bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-600"
                    : "bg-foreground text-background hover:bg-foreground/90"
                }`}
              >
                {followMutation.isPending
                  ? "Loading..."
                  : user.isFollowing
                  ? "Following"
                  : "Follow"}
              </button>
            )}

            {isOwnProfile && (
              <button className="mt-3 rounded-full border border-border px-4 py-2 font-semibold hover:bg-accent">
                Edit profile
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>

            {user.bio && <p className="whitespace-pre-wrap">{user.bio}</p>}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {user.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center space-x-1">
                  <LinkIcon className="h-4 w-4" />
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {user.website}
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>

            <div className="flex space-x-4 text-sm">
              <div>
                <span className="font-semibold">{user._count.following}</span>{" "}
                <span className="text-muted-foreground">Following</span>
              </div>
              <div>
                <span className="font-semibold">{user._count.followers}</span>{" "}
                <span className="text-muted-foreground">Followers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-border">
        <div className="flex">
          <button className="flex-1 py-4 font-semibold border-b-2 border-primary text-primary">
            Posts
          </button>
          <button className="flex-1 py-4 font-semibold text-muted-foreground hover:bg-accent">
            Replies
          </button>
          <button className="flex-1 py-4 font-semibold text-muted-foreground hover:bg-accent">
            Media
          </button>
        </div>
      </div>

      <Feed userId={userId} />
    </div>
  )
}
