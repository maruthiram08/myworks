/**
 * Streak Tracking System
 *
 * Manages user learning streaks and daily activity tracking
 */

import { isSameDay, isConsecutiveDay, getDaysDifference } from './utils';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  streakSafe: boolean;
  hoursUntilReset: number;
}

/**
 * Update user streak based on activity
 *
 * @param lastActiveDate - Last date user was active
 * @param currentStreak - Current streak count
 * @param longestStreak - Longest streak achieved
 * @returns Updated streak information
 */
export function updateStreak(
  lastActiveDate: Date | null,
  currentStreak: number = 0,
  longestStreak: number = 0
): {
  currentStreak: number;
  longestStreak: number;
  streakIncreased: boolean;
  streakBroken: boolean;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // First time user or no previous activity
  if (!lastActiveDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, longestStreak),
      streakIncreased: true,
      streakBroken: false,
    };
  }

  const lastActive = new Date(lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);

  // Already completed today
  if (isSameDay(lastActive, today)) {
    return {
      currentStreak,
      longestStreak,
      streakIncreased: false,
      streakBroken: false,
    };
  }

  // Consecutive day - increase streak
  if (isConsecutiveDay(lastActive, today)) {
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, longestStreak),
      streakIncreased: true,
      streakBroken: false,
    };
  }

  // Streak broken - reset to 1
  return {
    currentStreak: 1,
    longestStreak,
    streakIncreased: false,
    streakBroken: true,
  };
}

/**
 * Check if streak is in danger (close to breaking)
 *
 * @param lastActiveDate - Last date user was active
 * @returns Streak safety information
 */
export function checkStreakSafety(lastActiveDate: Date | null): {
  isSafe: boolean;
  hoursRemaining: number;
  willBreak: boolean;
} {
  if (!lastActiveDate) {
    return {
      isSafe: false,
      hoursRemaining: 24,
      willBreak: false,
    };
  }

  const now = new Date();
  const lastActive = new Date(lastActiveDate);

  // Check if it's the same day
  if (isSameDay(lastActive, now)) {
    // Safe for today, calculate hours until midnight
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const hoursRemaining = (midnight.getTime() - now.getTime()) / (1000 * 60 * 60);

    return {
      isSafe: true,
      hoursRemaining: Math.ceil(hoursRemaining),
      willBreak: false,
    };
  }

  // Check if it's consecutive
  if (isConsecutiveDay(lastActive, now)) {
    // Need to complete a lesson today
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const hoursRemaining = (midnight.getTime() - now.getTime()) / (1000 * 60 * 60);

    return {
      isSafe: false,
      hoursRemaining: Math.ceil(hoursRemaining),
      willBreak: true,
    };
  }

  // Streak already broken
  return {
    isSafe: false,
    hoursRemaining: 0,
    willBreak: true,
  };
}

/**
 * Get streak milestone reached
 *
 * @param streak - Current streak
 * @returns Milestone value if reached, 0 otherwise
 */
export function getStreakMilestone(streak: number): number {
  const milestones = [3, 7, 14, 30, 60, 100, 365];
  for (const milestone of milestones.reverse()) {
    if (streak === milestone) {
      return milestone;
    }
  }
  return 0;
}

/**
 * Get next streak milestone
 *
 * @param currentStreak - Current streak
 * @returns Next milestone and days remaining
 */
export function getNextMilestone(currentStreak: number): {
  milestone: number;
  daysRemaining: number;
} {
  const milestones = [3, 7, 14, 30, 60, 100, 365];

  for (const milestone of milestones) {
    if (currentStreak < milestone) {
      return {
        milestone,
        daysRemaining: milestone - currentStreak,
      };
    }
  }

  return {
    milestone: 365,
    daysRemaining: 0,
  };
}

/**
 * Get streak status message
 *
 * @param currentStreak - Current streak
 * @param lastActiveDate - Last active date
 * @returns Status message and emoji
 */
export function getStreakStatus(
  currentStreak: number,
  lastActiveDate: Date | null
): {
  message: string;
  emoji: string;
  color: string;
} {
  const { isSafe, willBreak, hoursRemaining } = checkStreakSafety(lastActiveDate);

  if (currentStreak === 0) {
    return {
      message: 'Start your streak today!',
      emoji: '🌟',
      color: 'text-gray-500',
    };
  }

  if (isSafe) {
    return {
      message: `${currentStreak} day streak! Keep it up!`,
      emoji: '🔥',
      color: 'text-orange-500',
    };
  }

  if (willBreak && hoursRemaining > 0) {
    return {
      message: `Complete a lesson in ${hoursRemaining}h to save your streak!`,
      emoji: '⚠️',
      color: 'text-yellow-500',
    };
  }

  return {
    message: 'Streak broken. Start a new one!',
    emoji: '💔',
    color: 'text-red-500',
  };
}

/**
 * Calculate streak freeze cost (in gems)
 *
 * @param streakLength - Current streak length
 * @returns Cost in gems
 */
export function getStreakFreezeCost(streakLength: number): number {
  if (streakLength < 7) return 10;
  if (streakLength < 30) return 15;
  if (streakLength < 60) return 20;
  return 25;
}

/**
 * Check if user qualifies for streak repair
 *
 * @param daysSinceBreak - Days since streak was broken
 * @param previousStreak - Previous streak length
 * @returns Whether user can repair and the cost
 */
export function canRepairStreak(
  daysSinceBreak: number,
  previousStreak: number
): {
  canRepair: boolean;
  cost: number;
} {
  // Can only repair within 24 hours
  if (daysSinceBreak > 1) {
    return { canRepair: false, cost: 0 };
  }

  // Must have had a streak of at least 7 days
  if (previousStreak < 7) {
    return { canRepair: false, cost: 0 };
  }

  const cost = Math.min(100, previousStreak * 2);

  return {
    canRepair: true,
    cost,
  };
}

/**
 * Get weekly activity summary
 *
 * @param activityDates - Array of activity dates in the past week
 * @returns Weekly summary
 */
export function getWeeklySummary(activityDates: Date[]): {
  daysActive: number;
  percentage: number;
  consistent: boolean;
} {
  const uniqueDays = new Set(
    activityDates.map((date) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  const daysActive = uniqueDays.size;
  const percentage = (daysActive / 7) * 100;
  const consistent = daysActive >= 5;

  return {
    daysActive,
    percentage,
    consistent,
  };
}
