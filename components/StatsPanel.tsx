'use client'

import { User } from "@prisma/client"
import { calculateLevel, xpForNextLevel, getXPProgress } from "@/lib/scoring"

interface StatsPanelProps {
  user: User
}

export function StatsPanel({ user }: StatsPanelProps) {
  const level = user.level
  const xpNeeded = xpForNextLevel(level)
  const xpProgress = getXPProgress(user.xp, level)

  return (
    <div className="card">
      {/* User Info */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="relative">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || 'User'}
              className="w-16 h-16 rounded-full border-4 border-primary-400"
            />
          ) : (
            <div className="w-16 h-16 rounded-full border-4 border-primary-400 bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {level}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 truncate">
            {user.name || 'User'}
          </div>
          <div className="text-sm text-gray-600">Level {level}</div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">XP Progress</span>
          <span className="font-semibold text-primary-600">
            {xpProgress}%
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${xpProgress}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {xpNeeded} XP to level {level + 1}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⭐</span>
            <span className="text-sm font-medium text-gray-700">Total XP</span>
          </div>
          <span className="font-bold text-yellow-800">{user.xp}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">💎</span>
            <span className="text-sm font-medium text-gray-700">Gems</span>
          </div>
          <span className="font-bold text-blue-800">{user.gems}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-100 to-red-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">❤️</span>
            <span className="text-sm font-medium text-gray-700">Hearts</span>
          </div>
          <span className="font-bold text-red-800">{user.hearts}</span>
        </div>
      </div>
    </div>
  )
}
