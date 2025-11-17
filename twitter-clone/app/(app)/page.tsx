"use client"

import CreatePost from "@/components/post/create-post"
import Feed from "@/components/feed/feed"
import { useEffect } from "react"
import { pusherClient } from "@/lib/pusher"
import { useQueryClient } from "@tanstack/react-query"

export default function HomePage() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = pusherClient.subscribe("posts")

    channel.bind("new-post", () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    })

    channel.bind("repost", () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    })

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
    }
  }, [queryClient])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <h1 className="p-4 text-xl font-bold">Home</h1>
      </div>
      <CreatePost />
      <Feed />
    </div>
  )
}
