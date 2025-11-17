'use client'

import Link from "next/link"
import { User, Streak } from "@prisma/client"
import { signOut } from "next-auth/react"

interface DashboardHeaderProps {
  user: User
  streak: Streak | null
}

export function DashboardHeader({ user, streak }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/learn" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
            <span className="text-xl font-bold text-gray-800 hidden sm:block">
              LearnQuest
            </span>
          </Link>

          {/* Stats Bar */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Streak */}
            <div className="flex items-center space-x-2 bg-orange-100 px-3 py-2 rounded-lg">
              <span className="text-xl">🔥</span>
              <span className="font-bold text-orange-800">
                {streak?.currentStreak || 0}
              </span>
            </div>

            {/* Hearts */}
            <div className="flex items-center space-x-2 bg-red-100 px-3 py-2 rounded-lg">
              <span className="text-xl">❤️</span>
              <span className="font-bold text-red-800">{user.hearts}</span>
            </div>

            {/* Gems */}
            <div className="hidden sm:flex items-center space-x-2 bg-blue-100 px-3 py-2 rounded-lg">
              <span className="text-xl">💎</span>
              <span className="font-bold text-blue-800">{user.gems}</span>
            </div>

            {/* XP */}
            <div className="hidden md:flex items-center space-x-2 bg-yellow-100 px-3 py-2 rounded-lg">
              <span className="text-xl">⭐</span>
              <span className="font-bold text-yellow-800">{user.xp}</span>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-2">
              <Link
                href="/leaderboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Leaderboard"
              >
                <span className="text-2xl">🏆</span>
              </Link>
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Dashboard"
              >
                <span className="text-2xl">📊</span>
              </Link>
              {user.isAdmin && (
                <Link
                  href="/admin"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Admin"
                >
                  <span className="text-2xl">⚙️</span>
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sign Out"
              >
                <span className="text-2xl">🚪</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
