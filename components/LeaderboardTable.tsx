'use client'

import { getRankFromXP } from "@/lib/leaderboard"

interface LeaderboardUser {
  id: string
  name: string | null
  image: string | null
  xp: number
  level: number
  streaks: { currentStreak: number }[]
}

interface LeaderboardTableProps {
  users: LeaderboardUser[]
  currentUserId: string
}

export function LeaderboardTable({ users, currentUserId }: LeaderboardTableProps) {
  const getMedalEmoji = (position: number) => {
    if (position === 1) return '🥇'
    if (position === 2) return '🥈'
    if (position === 3) return '🥉'
    return `#${position}`
  }

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-4 font-semibold text-gray-700">
                Rank
              </th>
              <th className="text-left py-4 px-4 font-semibold text-gray-700">
                User
              </th>
              <th className="text-center py-4 px-4 font-semibold text-gray-700">
                Level
              </th>
              <th className="text-center py-4 px-4 font-semibold text-gray-700">
                XP
              </th>
              <th className="text-center py-4 px-4 font-semibold text-gray-700">
                Rank
              </th>
              <th className="text-center py-4 px-4 font-semibold text-gray-700">
                Streak
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => {
              const rank = getRankFromXP(user.xp)
              const isCurrentUser = user.id === currentUserId
              const position = index + 1

              return (
                <tr
                  key={user.id}
                  className={`
                    border-b border-gray-100 transition-colors
                    ${isCurrentUser ? 'bg-primary-50' : 'hover:bg-gray-50'}
                  `}
                >
                  <td className="py-4 px-4">
                    <div className="text-xl font-bold">
                      {getMedalEmoji(position)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || 'User'}
                          className="w-10 h-10 rounded-full border-2 border-primary-400"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full border-2 border-primary-400 bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">
                          {user.name || 'Anonymous'}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs bg-primary-600 text-white px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="font-bold text-primary-600">
                      {user.level}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="font-semibold text-gray-900">
                      {user.xp.toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div
                      className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: rank.color }}
                    >
                      {rank.rank}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span>🔥</span>
                      <span className="font-bold text-orange-600">
                        {user.streaks[0]?.currentStreak || 0}
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
