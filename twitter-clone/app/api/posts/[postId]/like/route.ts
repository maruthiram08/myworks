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

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    })

    if (existingLike) {
      return NextResponse.json(
        { error: "Post already liked" },
        { status: 400 }
      )
    }

    const like = await prisma.like.create({
      data: {
        userId: session.user.id,
        postId,
      },
    })

    // Create notification for post author
    if (post.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          type: "LIKE",
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
          type: "LIKE",
          senderId: session.user.id,
          postId,
        }
      )
    }

    return NextResponse.json(like, { status: 201 })
  } catch (error) {
    console.error("Error liking post:", error)
    return NextResponse.json({ error: "Error liking post" }, { status: 500 })
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

    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    })

    if (!like) {
      return NextResponse.json({ error: "Like not found" }, { status: 404 })
    }

    await prisma.like.delete({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    })

    return NextResponse.json({ message: "Post unliked successfully" })
  } catch (error) {
    console.error("Error unliking post:", error)
    return NextResponse.json({ error: "Error unliking post" }, { status: 500 })
  }
}
