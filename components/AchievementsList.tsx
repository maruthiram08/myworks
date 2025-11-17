'use client'

import { UserAchievement, Achievement } from "@prisma/client"
import { formatDistanceToNow } from 'date-fns'

interface AchievementsListProps {
  achievements: (UserAchievement & { achievement: Achievement })[]
}

export function AchievementsList({ achievements }: AchievementsListProps) {
  if (achievements.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Achievements Yet
        </h3>
        <p className="text-gray-600">
          Complete lessons to unlock achievements!
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Achievements
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((ua) => (
          <div
            key={ua.id}
            className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl"
          >
            <div className="flex items-start space-x-3">
              <span className="text-4xl">{ua.achievement.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-gray-900">
                  {ua.achievement.title}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {ua.achievement.description}
                </div>
                <div className="text-xs text-gray-500">
                  Unlocked {formatDistanceToNow(new Date(ua.unlockedAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
