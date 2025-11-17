import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"

export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params

    const replies = await prisma.reply.findMany({
      where: { postId },
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
      },
    })

    return NextResponse.json(replies)
  } catch (error) {
    console.error("Error fetching replies:", error)
    return NextResponse.json(
      { error: "Error fetching replies" },
      { status: 500 }
    )
  }
}

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
    const { content, imageUrl, gifUrl } = await req.json()

    if (!content || content.length > 280) {
      return NextResponse.json(
        { error: "Content must be between 1 and 280 characters" },
        { status: 400 }
      )
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const reply = await prisma.reply.create({
      data: {
        content,
        imageUrl,
        gifUrl,
        userId: session.user.id,
        postId,
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
      },
    })

    // Create notification for post author
    if (post.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          type: "REPLY",
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
          type: "REPLY",
          senderId: session.user.id,
          postId,
        }
      )
    }

    return NextResponse.json(reply, { status: 201 })
  } catch (error) {
    console.error("Error creating reply:", error)
    return NextResponse.json(
      { error: "Error creating reply" },
      { status: 500 }
    )
  }
}
