"use client"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import Link from "next/link"
import { Hash, TrendingUp } from "lucide-react"

export default function TrendingSidebar() {
  const { data: hashtags } = useQuery({
    queryKey: ["trending"],
    queryFn: async () => {
      const { data } = await axios.get("/api/hashtags/trending?limit=5")
      return data
    },
  })

  return (
    <aside className="hidden xl:block sticky top-0 h-screen w-80 border-l border-border bg-background p-6">
      <div className="space-y-6">
        <div className="rounded-2xl bg-muted p-4">
          <h2 className="mb-4 flex items-center text-xl font-bold">
            <TrendingUp className="mr-2 h-5 w-5" />
            Trending
          </h2>
          <div className="space-y-3">
            {hashtags?.map((hashtag: any, index: number) => (
              <Link
                key={hashtag.id}
                href={`/hashtag/${hashtag.name}`}
                className="block rounded-lg p-3 transition-colors hover:bg-accent"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <Hash className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">{hashtag.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {hashtag.count} posts
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    #{index + 1}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-muted p-4">
          <h3 className="mb-3 font-bold">Who to follow</h3>
          <p className="text-sm text-muted-foreground">
            Suggested users will appear here
          </p>
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
          <span className="mx-2">·</span>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <p className="pt-2">© 2024 Twitter Clone</p>
        </div>
      </div>
    </aside>
  )
}
