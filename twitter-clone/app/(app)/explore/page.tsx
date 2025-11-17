"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import Link from "next/link"
import { Search, Hash, User, Loader2 } from "lucide-react"

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"all" | "users" | "posts" | "hashtags">("all")

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", searchQuery, searchType],
    queryFn: async () => {
      if (!searchQuery.trim()) return null
      const { data } = await axios.get(
        `/api/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`
      )
      return data
    },
    enabled: searchQuery.trim().length > 0,
  })

  const { data: trending } = useQuery({
    queryKey: ["trending"],
    queryFn: async () => {
      const { data } = await axios.get("/api/hashtags/trending?limit=10")
      return data
    },
  })

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Twitter"
            className="w-full rounded-full border border-border bg-muted/50 py-3 pl-12 pr-4 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {searchQuery && (
          <div className="mt-3 flex space-x-2">
            {(["all", "users", "posts", "hashtags"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSearchType(type)}
                className={`rounded-full px-4 py-1 text-sm font-medium ${
                  searchType === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-accent"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : searchResults ? (
        <div className="space-y-6 p-4">
          {searchResults.users && searchResults.users.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-bold">Users</h2>
              <div className="space-y-2">
                {searchResults.users.map((user: any) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.id}`}
                    className="flex items-center space-x-3 rounded-lg p-3 hover:bg-accent"
                  >
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || "User"}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        @{user.username}
                      </p>
                      {user.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {user.bio}
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user._count.followers} followers
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {searchResults.hashtags && searchResults.hashtags.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-bold">Hashtags</h2>
              <div className="space-y-2">
                {searchResults.hashtags.map((hashtag: any) => (
                  <Link
                    key={hashtag.id}
                    href={`/hashtag/${hashtag.name}`}
                    className="flex items-center justify-between rounded-lg p-3 hover:bg-accent"
                  >
                    <div className="flex items-center space-x-2">
                      <Hash className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold">{hashtag.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {hashtag.count} posts
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          <h2 className="mb-4 text-xl font-bold">Trending Hashtags</h2>
          <div className="space-y-2">
            {trending?.map((hashtag: any, index: number) => (
              <Link
                key={hashtag.id}
                href={`/hashtag/${hashtag.name}`}
                className="flex items-center justify-between rounded-lg p-4 hover:bg-accent"
              >
                <div className="flex items-start space-x-3">
                  <span className="text-sm text-muted-foreground">
                    #{index + 1}
                  </span>
                  <div>
                    <div className="flex items-center space-x-1">
                      <Hash className="h-4 w-4" />
                      <span className="font-semibold">{hashtag.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {hashtag.count} posts
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
