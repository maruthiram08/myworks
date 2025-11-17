/**
 * Daily quest system and quest generation
 */

import { QuestType } from "@prisma/client"

export interface QuestTemplate {
  type: QuestType
  title: string
  description: string
  target: number
  xpReward: number
  gemsReward: number
}

/**
 * Generate daily quests for a user
 */
export function generateDailyQuests(): QuestTemplate[] {
  const questPool: QuestTemplate[] = [
    {
      type: QuestType.COMPLETE_LESSONS,
      title: "Complete 3 lessons",
      description: "Finish 3 lessons to earn rewards",
      target: 3,
      xpReward: 50,
      gemsReward: 5,
    },
    {
      type: QuestType.COMPLETE_LESSONS,
      title: "Complete 5 lessons",
      description: "Finish 5 lessons to earn rewards",
      target: 5,
      xpReward: 100,
      gemsReward: 10,
    },
    {
      type: QuestType.EARN_XP,
      title: "Earn 100 XP",
      description: "Gain 100 experience points",
      target: 100,
      xpReward: 25,
      gemsReward: 3,
    },
    {
      type: QuestType.EARN_XP,
      title: "Earn 250 XP",
      description: "Gain 250 experience points",
      target: 250,
      xpReward: 75,
      gemsReward: 8,
    },
    {
      type: QuestType.PERFECT_SCORE,
      title: "Get 1 perfect score",
      description: "Complete a lesson with 100% accuracy",
      target: 1,
      xpReward: 75,
      gemsReward: 7,
    },
    {
      type: QuestType.PERFECT_SCORE,
      title: "Get 3 perfect scores",
      description: "Complete 3 lessons with 100% accuracy",
      target: 3,
      xpReward: 150,
      gemsReward: 15,
    },
    {
      type: QuestType.USE_APP_STREAK,
      title: "Maintain your streak",
      description: "Complete at least one lesson today",
      target: 1,
      xpReward: 30,
      gemsReward: 3,
    },
    {
      type: QuestType.REVIEW_LESSONS,
      title: "Review 2 lessons",
      description: "Review lessons that need practice",
      target: 2,
      xpReward: 40,
      gemsReward: 4,
    },
    {
      type: QuestType.REVIEW_LESSONS,
      title: "Review 5 lessons",
      description: "Review lessons that need practice",
      target: 5,
      xpReward: 100,
      gemsReward: 10,
    },
  ]

  // Select 3 random quests
  const shuffled = questPool.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

/**
 * Check if a quest should be auto-assigned to user
 */
export function shouldAssignQuest(questType: QuestType, userLevel: number): boolean {
  // Don't assign difficult quests to beginners
  if (userLevel < 3) {
    return ![
      QuestType.PERFECT_SCORE,
      QuestType.REVIEW_LESSONS,
    ].includes(questType)
  }

  return true
}

/**
 * Calculate quest progress from activity
 */
export function updateQuestProgress(
  questType: QuestType,
  currentProgress: number,
  activityData: {
    lessonsCompleted?: number
    xpEarned?: number
    perfectScores?: number
    streakMaintained?: boolean
    lessonsReviewed?: number
  }
): number {
  switch (questType) {
    case QuestType.COMPLETE_LESSONS:
      return currentProgress + (activityData.lessonsCompleted || 0)

    case QuestType.EARN_XP:
      return currentProgress + (activityData.xpEarned || 0)

    case QuestType.PERFECT_SCORE:
      return currentProgress + (activityData.perfectScores || 0)

    case QuestType.USE_APP_STREAK:
      return activityData.streakMaintained ? 1 : currentProgress

    case QuestType.REVIEW_LESSONS:
      return currentProgress + (activityData.lessonsReviewed || 0)

    default:
      return currentProgress
  }
}

/**
 * Check if it's time to reset daily quests
 */
export function shouldResetDailyQuests(lastAssignedDate: Date, timezone: string = 'UTC'): boolean {
  const now = new Date()
  const lastAssigned = new Date(lastAssignedDate)

  // Reset if last assigned was on a different day (in user's timezone)
  const nowDay = now.toLocaleDateString('en-US', { timeZone: timezone })
  const lastDay = lastAssigned.toLocaleDateString('en-US', { timeZone: timezone })

  return nowDay !== lastDay
}
