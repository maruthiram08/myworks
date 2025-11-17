"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useInView } from "react-intersection-observer"
import { useEffect } from "react"
import { PostCard } from "@/components/post/post-card"

export default function BookmarksPage() {
  const { ref, inView } = useInView()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["bookmarks"],
    queryFn: async ({ pageParam }) => {
      const url = new URL("/api/bookmarks", window.location.origin)
      if (pageParam) url.searchParams.set("cursor", pageParam)
      url.searchParams.set("limit", "10")

      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch bookmarks")
      return res.json()
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 p-4 z-10">
        <h1 className="text-xl font-bold">Bookmarks</h1>
      </div>

      {/* Bookmarked posts */}
      {isLoading && (
        <div className="p-8 text-center text-gray-500">
          Loading bookmarks...
        </div>
      )}

      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.posts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ))}

      {data && data.pages[0]?.posts.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No bookmarks yet. Bookmark posts to see them here!
        </div>
      )}

      {hasNextPage && (
        <div ref={ref} className="p-8 text-center text-gray-500">
          {isFetchingNextPage ? "Loading more..." : "Load more"}
        </div>
      )}
    </div>
  )
}
