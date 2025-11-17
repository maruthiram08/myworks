import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") || "all"

    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 })
    }

    const results: any = {
      users: [],
      posts: [],
      hashtags: [],
    }

    if (type === "all" || type === "users") {
      results.users = await prisma.user.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              username: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          bio: true,
          _count: {
            select: {
              followers: true,
            },
          },
        },
        take: 10,
      })
    }

    if (type === "all" || type === "posts") {
      results.posts = await prisma.post.findMany({
        where: {
          content: {
            contains: query,
            mode: "insensitive",
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              replies: true,
              reposts: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      })
    }

    if (type === "all" || type === "hashtags") {
      results.hashtags = await prisma.hashtag.findMany({
        where: {
          name: {
            contains: query.replace("#", ""),
            mode: "insensitive",
          },
        },
        orderBy: {
          count: "desc",
        },
        take: 10,
      })
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error searching:", error)
    return NextResponse.json({ error: "Error searching" }, { status: 500 })
  }
}
