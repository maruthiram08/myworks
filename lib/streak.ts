/**
 * Streak tracking system with timezone support
 */

import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz'
import { differenceInDays, startOfDay, endOfDay } from 'date-fns'

/**
 * Check if user's last activity was today (in their timezone)
 */
export function wasActiveToday(
  lastActivity: Date,
  timezone: string = 'UTC'
): boolean {
  const now = new Date()
  const userNow = utcToZonedTime(now, timezone)
  const userLastActivity = utcToZonedTime(lastActivity, timezone)

  const todayStart = startOfDay(userNow)
  const lastActivityDate = startOfDay(userLastActivity)

  return todayStart.getTime() === lastActivityDate.getTime()
}

/**
 * Check if user's last activity was yesterday (in their timezone)
 */
export function wasActiveYesterday(
  lastActivity: Date,
  timezone: string = 'UTC'
): boolean {
  const now = new Date()
  const userNow = utcToZonedTime(now, timezone)
  const userLastActivity = utcToZonedTime(lastActivity, timezone)

  const daysDiff = differenceInDays(
    startOfDay(userNow),
    startOfDay(userLastActivity)
  )

  return daysDiff === 1
}

/**
 * Calculate updated streak after user completes an activity
 */
export function updateStreak(
  currentStreak: number,
  longestStreak: number,
  lastActivity: Date,
  timezone: string = 'UTC',
  frozenDays: number = 0
): {
  currentStreak: number
  longestStreak: number
  frozenDays: number
  streakIncreased: boolean
  streakSaved: boolean
} {
  const activeToday = wasActiveToday(lastActivity, timezone)
  const activeYesterday = wasActiveYesterday(lastActivity, timezone)

  // Already active today, no change
  if (activeToday) {
    return {
      currentStreak,
      longestStreak,
      frozenDays,
      streakIncreased: false,
      streakSaved: false,
    }
  }

  let newStreak = currentStreak
  let streakIncreased = false
  let streakSaved = false
  let newFrozenDays = frozenDays

  // Active yesterday, continue streak
  if (activeYesterday) {
    newStreak = currentStreak + 1
    streakIncreased = true
  } else {
    // Check if we can use a streak freeze
    const daysSinceActivity = differenceInDays(
      startOfDay(new Date()),
      startOfDay(lastActivity)
    )

    if (daysSinceActivity <= frozenDays + 1) {
      // Streak saved by freeze
      newFrozenDays = Math.max(0, frozenDays - (daysSinceActivity - 1))
      newStreak = currentStreak + 1
      streakIncreased = true
      streakSaved = true
    } else {
      // Streak broken, start over
      newStreak = 1
      newFrozenDays = 0
    }
  }

  const newLongestStreak = Math.max(longestStreak, newStreak)

  return {
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    frozenDays: newFrozenDays,
    streakIncreased,
    streakSaved,
  }
}

/**
 * Check if streak is at risk (last activity was yesterday)
 */
export function isStreakAtRisk(
  lastActivity: Date,
  timezone: string = 'UTC'
): boolean {
  if (wasActiveToday(lastActivity, timezone)) {
    return false
  }

  return wasActiveYesterday(lastActivity, timezone)
}

/**
 * Calculate hours until streak expires
 */
export function hoursUntilStreakExpires(
  timezone: string = 'UTC'
): number {
  const now = new Date()
  const userNow = utcToZonedTime(now, timezone)
  const endOfToday = endOfDay(userNow)
  const hoursLeft = (endOfToday.getTime() - userNow.getTime()) / (1000 * 60 * 60)

  return Math.max(0, Math.ceil(hoursLeft))
}

/**
 * Get streak milestone rewards
 */
export function getStreakMilestoneReward(streak: number): {
  hasReward: boolean
  gems?: number
  freezeDays?: number
  xp?: number
} {
  const milestones = [
    { streak: 7, gems: 10, freezeDays: 1, xp: 50 },
    { streak: 14, gems: 20, freezeDays: 1, xp: 100 },
    { streak: 30, gems: 50, freezeDays: 2, xp: 250 },
    { streak: 60, gems: 100, freezeDays: 3, xp: 500 },
    { streak: 100, gems: 200, freezeDays: 5, xp: 1000 },
    { streak: 365, gems: 1000, freezeDays: 10, xp: 5000 },
  ]

  const milestone = milestones.find(m => m.streak === streak)

  if (milestone) {
    return {
      hasReward: true,
      ...milestone,
    }
  }

  return { hasReward: false }
}
