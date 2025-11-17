import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/DashboardHeader"
import { UnitCard } from "@/components/UnitCard"
import { QuestsPanel } from "@/components/QuestsPanel"
import { StatsPanel } from "@/components/StatsPanel"

export default async function LearnPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Fetch languages with units and lessons
  const languages = await prisma.language.findMany({
    where: { isActive: true },
    include: {
      units: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: {
              progress: {
                where: {
                  userId: session.user.id,
                },
              },
            },
          },
        },
      },
    },
  })

  // Get user data
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
    },
  })

  if (!user) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
      <DashboardHeader user={user} streak={user.streaks[0]} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {languages.map((language) => (
              <div key={language.id} className="space-y-6">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{language.flag}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {language.name}
                    </h2>
                    <p className="text-gray-600">{language.description}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {language.units.map((unit) => (
                    <UnitCard
                      key={unit.id}
                      unit={unit}
                      userId={session.user.id}
                    />
                  ))}
                </div>
              </div>
            ))}

            {languages.length === 0 && (
              <div className="card text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Languages Available
                </h3>
                <p className="text-gray-600">
                  Check back soon for new learning content!
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <StatsPanel user={user} />
            <QuestsPanel quests={user.quests} />
          </div>
        </div>
      </main>
    </div>
  )
}
