import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/learn")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">LearnQuest</span>
          </div>
          <Link
            href="/auth/signin"
            className="btn-secondary"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-6xl font-extrabold text-gray-900 leading-tight">
              Learn Product
              <span className="block text-primary-600">Management</span>
              <span className="block">Like Never Before</span>
            </h1>
            <p className="text-xl text-gray-600">
              Master product management skills through interactive lessons,
              earn XP, compete on leaderboards, and track your progress with our
              gamified learning platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/signin"
                className="btn-primary text-center"
              >
                Get Started Free
              </Link>
              <Link
                href="#features"
                className="btn-secondary text-center"
              >
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <div className="text-3xl font-bold text-primary-600">10K+</div>
                <div className="text-sm text-gray-600">Active Learners</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600">500+</div>
                <div className="text-sm text-gray-600">Lessons</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="relative">
            <div className="card p-8 space-y-6 animate-float">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    LV
                  </div>
                  <div>
                    <div className="font-semibold">Level 12</div>
                    <div className="text-sm text-gray-500">Product Manager</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🔥</span>
                  <span className="font-bold text-orange-600">24</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Daily Progress</span>
                  <span className="text-primary-600">75%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="stat-card from-yellow-400 to-yellow-600">
                  <span className="text-3xl">⭐</span>
                  <div>
                    <div className="text-2xl font-bold">2,450</div>
                    <div className="text-xs opacity-90">XP Points</div>
                  </div>
                </div>
                <div className="stat-card from-blue-400 to-blue-600">
                  <span className="text-3xl">💎</span>
                  <div>
                    <div className="text-2xl font-bold">156</div>
                    <div className="text-xs opacity-90">Gems</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-32 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-gray-900">
              Why Choose LearnQuest?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience learning like never before with our gamified approach
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="card text-center space-y-4">
              <div className="text-5xl">🎮</div>
              <h3 className="text-xl font-bold">Gamified Learning</h3>
              <p className="text-gray-600">
                Earn XP, unlock achievements, and level up as you learn
              </p>
            </div>

            <div className="card text-center space-y-4">
              <div className="text-5xl">📊</div>
              <h3 className="text-xl font-bold">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your improvement with detailed analytics and insights
              </p>
            </div>

            <div className="card text-center space-y-4">
              <div className="text-5xl">🏆</div>
              <h3 className="text-xl font-bold">Compete & Win</h3>
              <p className="text-gray-600">
                Climb leaderboards and challenge friends to stay motivated
              </p>
            </div>

            <div className="card text-center space-y-4">
              <div className="text-5xl">🔥</div>
              <h3 className="text-xl font-bold">Daily Streaks</h3>
              <p className="text-gray-600">
                Build consistency with streak tracking and reminders
              </p>
            </div>

            <div className="card text-center space-y-4">
              <div className="text-5xl">🎯</div>
              <h3 className="text-xl font-bold">Daily Quests</h3>
              <p className="text-gray-600">
                Complete challenges and earn bonus rewards every day
              </p>
            </div>

            <div className="card text-center space-y-4">
              <div className="text-5xl">📱</div>
              <h3 className="text-xl font-bold">Learn Anywhere</h3>
              <p className="text-gray-600">
                Offline support lets you learn on the go, anytime
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-32 py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-2xl font-bold mb-4">LearnQuest</div>
          <p className="text-gray-400 mb-8">
            Making learning fun and effective through gamification
          </p>
          <div className="text-sm text-gray-500">
            © 2024 LearnQuest. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
