import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/DashboardHeader"
import { ProgressChart } from "@/components/ProgressChart"
import { ActivityCalendar } from "@/components/ActivityCalendar"
import { AchievementsList } from "@/components/AchievementsList"
import { getRankFromXP } from "@/lib/leaderboard"
import { xpForNextLevel, getXPProgress } from "@/lib/scoring"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      streaks: true,
      progress: {
        include: {
          lesson: {
            include: {
              unit: {
                include: {
                  language: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 10,
      },
      achievements: {
        include: {
          achievement: true,
        },
        orderBy: {
          unlockedAt: 'desc',
        },
      },
      answers: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
      },
    },
  })

  if (!user) {
    redirect("/auth/signin")
  }

  const rank = getRankFromXP(user.xp)
  const xpNeeded = xpForNextLevel(user.level)
  const xpProgress = getXPProgress(user.xp, user.level)

  // Calculate stats
  const totalLessons = user.progress.filter(p => p.completed).length
  const avgAccuracy = user.progress.length > 0
    ? user.progress.reduce((sum, p) => sum + p.accuracy, 0) / user.progress.length
    : 0

  const perfectScores = user.progress.filter(p => p.accuracy === 100).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
      <DashboardHeader user={user} streak={user.streaks[0]} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Your Learning Dashboard
        </h1>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Current Rank</div>
            <div
              className="text-3xl font-bold mb-2"
              style={{ color: rank.color }}
            >
              {rank.rank}
            </div>
            <div className="text-xs text-gray-500">
              {rank.xpNeeded} XP to {rank.nextRank}
            </div>
          </div>

          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Lessons Completed</div>
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {totalLessons}
            </div>
            <div className="text-xs text-gray-500">Keep learning!</div>
          </div>

          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Average Accuracy</div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {Math.round(avgAccuracy)}%
            </div>
            <div className="text-xs text-gray-500">
              {perfectScores} perfect scores
            </div>
          </div>

          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Current Streak</div>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {user.streaks[0]?.currentStreak || 0}
            </div>
            <div className="text-xs text-gray-500">
              Longest: {user.streaks[0]?.longestStreak || 0} days
            </div>
          </div>
        </div>

        {/* Charts and Activity */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Learning Progress
            </h2>
            <ProgressChart answers={user.answers} />
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Activity Calendar
            </h2>
            <ActivityCalendar answers={user.answers} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Recent Lessons
          </h2>
          <div className="space-y-3">
            {user.progress.slice(0, 5).map((progress) => (
              <div
                key={progress.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {progress.accuracy === 100 ? '⭐' : '✅'}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {progress.lesson.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      {progress.lesson.unit.language.name} - {progress.lesson.unit.title}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary-600">
                    {Math.round(progress.accuracy)}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {progress.score} XP
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <AchievementsList achievements={user.achievements} />
      </main>
    </div>
  )
}
