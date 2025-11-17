import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { questId } = body

    const userQuest = await prisma.userQuest.findUnique({
      where: {
        id: questId,
      },
      include: {
        quest: true,
      },
    })

    if (!userQuest) {
      return NextResponse.json(
        { error: 'Quest not found' },
        { status: 404 }
      )
    }

    if (userQuest.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!userQuest.completed || userQuest.claimed) {
      return NextResponse.json(
        { error: 'Quest cannot be claimed' },
        { status: 400 }
      )
    }

    // Update user quest and user stats in transaction
    const [updatedQuest, updatedUser] = await prisma.$transaction([
      prisma.userQuest.update({
        where: { id: questId },
        data: {
          claimed: true,
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          xp: {
            increment: userQuest.quest.xpReward,
          },
          gems: {
            increment: userQuest.quest.gemsReward,
          },
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      xpEarned: userQuest.quest.xpReward,
      gemsEarned: userQuest.quest.gemsReward,
      newXP: updatedUser.xp,
      newGems: updatedUser.gems,
    })
  } catch (error) {
    console.error('Error claiming quest:', error)
    return NextResponse.json(
      { error: 'Failed to claim quest' },
      { status: 500 }
    )
  }
}
