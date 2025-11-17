import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = params

    if (session.user.id === userId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      )
    }

    const userToFollow = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!userToFollow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId,
        },
      },
    })

    if (existingFollow) {
      return NextResponse.json(
        { error: "Already following this user" },
        { status: 400 }
      )
    }

    const follow = await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId: userId,
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        type: "FOLLOW",
        userId: userId,
        senderId: session.user.id,
      },
    })

    // Trigger real-time notification
    await pusherServer.trigger(
      `user-${userId}`,
      "notification",
      {
        type: "FOLLOW",
        senderId: session.user.id,
      }
    )

    return NextResponse.json(follow, { status: 201 })
  } catch (error) {
    console.error("Error following user:", error)
    return NextResponse.json(
      { error: "Error following user" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = params

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId,
        },
      },
    })

    if (!follow) {
      return NextResponse.json(
        { error: "Not following this user" },
        { status: 404 }
      )
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId,
        },
      },
    })

    return NextResponse.json({ message: "Unfollowed successfully" })
  } catch (error) {
    console.error("Error unfollowing user:", error)
    return NextResponse.json(
      { error: "Error unfollowing user" },
      { status: 500 }
    )
  }
}
