"use client"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import PostCard from "@/components/post/post-card"
import { Loader2 } from "lucide-react"

export default function BookmarksPage() {
  const { data: bookmarks, isLoading } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      const { data } = await axios.get("/api/posts?bookmarked=true")
      return data.posts
    },
  })

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <h1 className="p-4 text-xl font-bold">Bookmarks</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : bookmarks && bookmarks.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-xl font-bold mb-2">Save posts for later</p>
          <p className="text-muted-foreground">
            Bookmark posts to easily find them again in the future.
          </p>
        </div>
      ) : (
        <div>
          {bookmarks?.map((bookmark: any) => (
            <PostCard key={bookmark.id} post={bookmark} />
          ))}
        </div>
      )}
    </div>
  )
}
