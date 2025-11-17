import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"
import { extractHashtags } from "@/lib/utils"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get("cursor")
    const limit = parseInt(searchParams.get("limit") || "10")
    const userId = searchParams.get("userId")
    const hashtag = searchParams.get("hashtag")

    const where: any = {}

    if (userId) {
      where.userId = userId
    }

    if (hashtag) {
      where.hashtags = {
        some: {
          hashtag: {
            name: hashtag.toLowerCase()
          }
        }
      }
    }

    const posts = await prisma.post.findMany({
      where,
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "desc",
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
        likes: session?.user
          ? {
              where: {
                userId: session.user.id,
              },
            }
          : false,
        bookmarks: session?.user
          ? {
              where: {
                userId: session.user.id,
              },
            }
          : false,
        reposts: session?.user
          ? {
              where: {
                userId: session.user.id,
              },
            }
          : false,
        _count: {
          select: {
            likes: true,
            replies: true,
            reposts: true,
          },
        },
      },
    })

    return NextResponse.json({
      posts,
      nextCursor: posts.length === limit ? posts[posts.length - 1].id : null,
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json(
      { error: "Error fetching posts" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, imageUrl, gifUrl } = await req.json()

    if (!content || content.length > 280) {
      return NextResponse.json(
        { error: "Content must be between 1 and 280 characters" },
        { status: 400 }
      )
    }

    // Extract hashtags
    const hashtags = extractHashtags(content)

    // Create or update hashtags
    const hashtagRecords = await Promise.all(
      hashtags.map(async (tag) => {
        return prisma.hashtag.upsert({
          where: { name: tag },
          update: { count: { increment: 1 } },
          create: { name: tag, count: 1 },
        })
      })
    )

    // Create post
    const post = await prisma.post.create({
      data: {
        content,
        imageUrl,
        gifUrl,
        userId: session.user.id,
        hashtags: {
          create: hashtagRecords.map((hashtag) => ({
            hashtagId: hashtag.id,
          })),
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
    })

    // Trigger real-time event
    await pusherServer.trigger("posts", "new-post", post)

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json(
      { error: "Error creating post" },
      { status: 500 }
    )
  }
}
