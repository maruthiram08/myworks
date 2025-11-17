import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/DashboardHeader"
import { LeaderboardTable } from "@/components/LeaderboardTable"

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      streaks: true,
    },
  })

  if (!user) {
    redirect("/auth/signin")
  }

  // Fetch top users
  const topUsers = await prisma.user.findMany({
    take: 50,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
      <DashboardHeader user={user} streak={user.streaks[0]} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏆 Leaderboard
          </h1>
          <p className="text-gray-600">
            Compete with learners from around the world
          </p>
        </div>

        <LeaderboardTable
          users={topUsers}
          currentUserId={session.user.id}
        />
      </main>
    </div>
  )
}
