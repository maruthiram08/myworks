import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getRankFromXP } from "@/lib/leaderboard"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get top users by XP
    const users = await prisma.user.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        xp: 'desc',
      },
      select: {
        id: true,
        name: true,
        image: true,
        xp: true,
        level: true,
        streaks: {
          select: {
            currentStreak: true,
          },
        },
      },
    })

    const leaderboard = users.map((user, index) => {
      const rank = getRankFromXP(user.xp)
      return {
        position: offset + index + 1,
        userId: user.id,
        name: user.name,
        image: user.image,
        xp: user.xp,
        level: user.level,
        rank: rank.rank,
        rankColor: rank.color,
        streakDays: user.streaks[0]?.currentStreak || 0,
        isCurrentUser: user.id === session.user.id,
      }
    })

    // Get current user's position if not in top list
    const currentUserInList = leaderboard.find(u => u.isCurrentUser)
    let currentUserPosition = null

    if (!currentUserInList) {
      const usersAbove = await prisma.user.count({
        where: {
          xp: {
            gt: (await prisma.user.findUnique({
              where: { id: session.user.id },
              select: { xp: true },
            }))?.xp || 0,
          },
        },
      })

      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          streaks: true,
        },
      })

      if (currentUser) {
        const rank = getRankFromXP(currentUser.xp)
        currentUserPosition = {
          position: usersAbove + 1,
          userId: currentUser.id,
          name: currentUser.name,
          image: currentUser.image,
          xp: currentUser.xp,
          level: currentUser.level,
          rank: rank.rank,
          rankColor: rank.color,
          streakDays: currentUser.streaks[0]?.currentStreak || 0,
          isCurrentUser: true,
        }
      }
    }

    return NextResponse.json({
      leaderboard,
      currentUserPosition: currentUserPosition || currentUserInList,
      hasMore: users.length === limit,
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
