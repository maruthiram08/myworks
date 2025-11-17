import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getRankFromXP } from "@/lib/leaderboard"
import { xpForNextLevel, getXPProgress } from "@/lib/scoring"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        streaks: true,
        quests: {
          where: {
            assignedDate: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
          include: {
            quest: true,
          },
        },
        progress: {
          where: {
            completed: true,
          },
        },
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const rank = getRankFromXP(user.xp)
    const xpNeeded = xpForNextLevel(user.level)
    const xpProgress = getXPProgress(user.xp, user.level)

    // Get leaderboard position
    const usersAbove = await prisma.user.count({
      where: {
        xp: {
          gt: user.xp,
        },
      },
    })

    const totalUsers = await prisma.user.count()
    const percentile = Math.round(((totalUsers - usersAbove) / totalUsers) * 100)

    const stats = {
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
        xp: user.xp,
        level: user.level,
        hearts: user.hearts,
        gems: user.gems,
      },
      rank: rank.rank,
      nextRank: rank.nextRank,
      xpNeeded: rank.xpNeeded,
      xpForNextLevel: xpNeeded,
      xpProgress,
      leaderboardPosition: usersAbove + 1,
      percentile,
      streak: user.streaks[0] || {
        currentStreak: 0,
        longestStreak: 0,
        lastActivity: new Date(),
      },
      dailyQuests: user.quests.map(uq => ({
        id: uq.id,
        title: uq.quest.title,
        description: uq.quest.description,
        type: uq.quest.type,
        progress: uq.progress,
        target: uq.quest.target,
        completed: uq.completed,
        claimed: uq.claimed,
        xpReward: uq.quest.xpReward,
        gemsReward: uq.quest.gemsReward,
      })),
      lessonsCompleted: user.progress.length,
      achievements: user.achievements.map(ua => ({
        id: ua.achievement.id,
        title: ua.achievement.title,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        unlockedAt: ua.unlockedAt,
      })),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}
