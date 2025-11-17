"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { PostCard } from "@/components/post/post-card"
import { UserCard } from "@/components/user/user-card"
import { Input } from "@/components/ui/input"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [query, setQuery] = useState(initialQuery)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [tab, setTab] = useState<"all" | "posts" | "users">("all")

  const { data, isLoading } = useQuery({
    queryKey: ["search", searchQuery, tab],
    queryFn: async () => {
      if (!searchQuery) return null
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=${tab}`)
      if (!res.ok) throw new Error("Failed to search")
      return res.json()
    },
    enabled: !!searchQuery,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(query)
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 p-4 z-10">
        <form onSubmit={handleSearch} className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </form>
      </div>

      {/* Tabs */}
      {searchQuery && (
        <div className="border-b border-gray-200 dark:border-gray-800 flex">
          <button
            className={`flex-1 py-4 font-semibold ${
              tab === "all" ? "border-b-2 border-blue-500" : "text-gray-500"
            }`}
            onClick={() => setTab("all")}
          >
            All
          </button>
          <button
            className={`flex-1 py-4 font-semibold ${
              tab === "posts" ? "border-b-2 border-blue-500" : "text-gray-500"
            }`}
            onClick={() => setTab("posts")}
          >
            Posts
          </button>
          <button
            className={`flex-1 py-4 font-semibold ${
              tab === "users" ? "border-b-2 border-blue-500" : "text-gray-500"
            }`}
            onClick={() => setTab("users")}
          >
            Users
          </button>
        </div>
      )}

      {/* Results */}
      {isLoading && (
        <div className="p-8 text-center text-gray-500">Searching...</div>
      )}

      {!searchQuery && (
        <div className="p-8 text-center text-gray-500">
          Enter a search query to find posts and users
        </div>
      )}

      {data && (
        <div>
          {/* Posts */}
          {(tab === "all" || tab === "posts") && data.posts && (
            <div>
              {data.posts.length > 0 ? (
                data.posts.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No posts found
                </div>
              )}
            </div>
          )}

          {/* Users */}
          {(tab === "all" || tab === "users") && data.users && (
            <div>
              {data.users.length > 0 ? (
                data.users.map((user: any) => (
                  <UserCard key={user.id} user={user} />
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
