import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { postId } = params

    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const existingRepost = await prisma.repost.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    })

    if (existingRepost) {
      return NextResponse.json(
        { error: "Post already reposted" },
        { status: 400 }
      )
    }

    const repost = await prisma.repost.create({
      data: {
        userId: session.user.id,
        postId,
      },
    })

    // Create notification for post author
    if (post.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          type: "REPOST",
          userId: post.userId,
          senderId: session.user.id,
          postId,
        },
      })

      // Trigger real-time notification
      await pusherServer.trigger(
        `user-${post.userId}`,
        "notification",
        {
          type: "REPOST",
          senderId: session.user.id,
          postId,
        }
      )
    }

    // Trigger real-time event for feed
    await pusherServer.trigger("posts", "repost", {
      userId: session.user.id,
      postId,
    })

    return NextResponse.json(repost, { status: 201 })
  } catch (error) {
    console.error("Error reposting post:", error)
    return NextResponse.json(
      { error: "Error reposting post" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { postId } = params

    const repost = await prisma.repost.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    })

    if (!repost) {
      return NextResponse.json({ error: "Repost not found" }, { status: 404 })
    }

    await prisma.repost.delete({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    })

    return NextResponse.json({ message: "Repost removed successfully" })
  } catch (error) {
    console.error("Error removing repost:", error)
    return NextResponse.json(
      { error: "Error removing repost" },
      { status: 500 }
    )
  }
}
