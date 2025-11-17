'use client'

import { UserQuest, Quest } from "@prisma/client"
import { useState } from "react"
import toast from "react-hot-toast"

interface QuestsPanelProps {
  quests: (UserQuest & { quest: Quest })[]
}

export function QuestsPanel({ quests }: QuestsPanelProps) {
  const [claiming, setClaiming] = useState<string | null>(null)

  const handleClaim = async (questId: string) => {
    try {
      setClaiming(questId)
      const response = await fetch('/api/quests/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId }),
      })

      if (!response.ok) throw new Error('Failed to claim quest')

      const data = await response.json()
      toast.success(
        `Quest completed! +${data.xpEarned} XP, +${data.gemsEarned} Gems 🎉`
      )

      // Refresh the page to update stats
      window.location.reload()
    } catch (error) {
      toast.error('Failed to claim quest reward')
    } finally {
      setClaiming(null)
    }
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-2xl">🎯</span>
        <h3 className="text-lg font-bold text-gray-900">Daily Quests</h3>
      </div>

      <div className="space-y-3">
        {quests.map((userQuest) => {
          const progress = Math.min(
            (userQuest.progress / userQuest.quest.target) * 100,
            100
          )

          return (
            <div
              key={userQuest.id}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${userQuest.completed
                  ? 'bg-primary-50 border-primary-300'
                  : 'bg-gray-50 border-gray-200'
                }
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-900">
                    {userQuest.quest.title}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {userQuest.progress} / {userQuest.quest.target}
                  </div>
                </div>
                {userQuest.completed && (
                  <span className="text-xl">
                    {userQuest.claimed ? '✅' : '🎁'}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="progress-bar h-2 mb-2">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {/* Rewards */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="xp-badge">
                    +{userQuest.quest.xpReward} XP
                  </span>
                  {userQuest.quest.gemsReward > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      +{userQuest.quest.gemsReward} 💎
                    </span>
                  )}
                </div>

                {userQuest.completed && !userQuest.claimed && (
                  <button
                    onClick={() => handleClaim(userQuest.id)}
                    disabled={claiming === userQuest.id}
                    className="px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {claiming === userQuest.id ? 'Claiming...' : 'Claim'}
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {quests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-sm">No quests available</div>
          </div>
        )}
      </div>
    </div>
  )
}
