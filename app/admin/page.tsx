import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    redirect("/learn")
  }

  const stats = await prisma.$transaction([
    prisma.user.count(),
    prisma.language.count(),
    prisma.lesson.count(),
    prisma.question.count(),
  ])

  const [userCount, languageCount, lessonCount, questionCount] = stats

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your learning platform content
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Total Users</div>
            <div className="text-3xl font-bold text-primary-600">{userCount}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Languages</div>
            <div className="text-3xl font-bold text-blue-600">{languageCount}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Lessons</div>
            <div className="text-3xl font-bold text-green-600">{lessonCount}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Questions</div>
            <div className="text-3xl font-bold text-orange-600">{questionCount}</div>
          </div>
        </div>

        {/* Management Links */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/languages"
            className="card hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="text-4xl mb-3">🌐</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Languages
            </h3>
            <p className="text-gray-600">
              Create and manage learning languages
            </p>
          </Link>

          <Link
            href="/admin/units"
            className="card hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Units
            </h3>
            <p className="text-gray-600">
              Organize lessons into units
            </p>
          </Link>

          <Link
            href="/admin/lessons"
            className="card hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="text-4xl mb-3">📖</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Lessons
            </h3>
            <p className="text-gray-600">
              Create and edit lessons
            </p>
          </Link>

          <Link
            href="/admin/questions"
            className="card hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="text-4xl mb-3">❓</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Questions
            </h3>
            <p className="text-gray-600">
              Add and manage questions
            </p>
          </Link>

          <Link
            href="/admin/quests"
            className="card hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Quests
            </h3>
            <p className="text-gray-600">
              Create daily quests for users
            </p>
          </Link>

          <Link
            href="/admin/achievements"
            className="card hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Achievements
            </h3>
            <p className="text-gray-600">
              Define achievements and rewards
            </p>
          </Link>
        </div>

        <div className="mt-8">
          <Link
            href="/learn"
            className="btn-secondary inline-block"
          >
            ← Back to Learning
          </Link>
        </div>
      </div>
    </div>
  )
}
