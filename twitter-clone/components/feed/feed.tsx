"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"
import { useEffect, useRef } from "react"
import PostCard from "@/components/post/post-card"
import { Loader2 } from "lucide-react"

interface FeedProps {
  userId?: string
  hashtag?: string
}

export default function Feed({ userId, hashtag }: FeedProps) {
  const observerTarget = useRef<HTMLDivElement>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["posts", userId, hashtag],
    queryFn: async ({ pageParam = null }) => {
      const params = new URLSearchParams()
      if (pageParam) params.append("cursor", pageParam)
      if (userId) params.append("userId", userId)
      if (hashtag) params.append("hashtag", hashtag)
      params.append("limit", "10")

      const { data } = await axios.get(`/api/posts?${params.toString()}`)
      return data
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 1.0 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Error loading posts. Please try again later.
      </div>
    )
  }

  const posts = data?.pages.flatMap((page) => page.posts) || []

  if (posts.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No posts yet. Be the first to post!
      </div>
    )
  }

  return (
    <div>
      {posts.map((post: any) => (
        <PostCard key={post.id} post={post} />
      ))}

      <div ref={observerTarget} className="flex justify-center p-4">
        {isFetchingNextPage && (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        )}
      </div>

      {!hasNextPage && posts.length > 0 && (
        <div className="p-8 text-center text-sm text-muted-foreground">
          You've reached the end
        </div>
      )}
    </div>
  )
}
