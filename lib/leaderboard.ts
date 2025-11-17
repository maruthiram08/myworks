/**
 * Leaderboard System
 *
 * Manages rankings and competitive features
 */

import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth } from 'date-fns';

export type LeaderboardPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';

export interface LeaderboardEntry {
  userId: string;
  username: string;
  userImage: string | null;
  xp: number;
  level: number;
  streak: number;
  rank: number;
}

/**
 * Get date range for leaderboard period
 *
 * @param period - Leaderboard period
 * @param date - Reference date (defaults to now)
 * @returns Start and end dates for the period
 */
export function getLeaderboardDateRange(
  period: LeaderboardPeriod,
  date: Date = new Date()
): {
  start: Date;
  end: Date;
  periodDate: Date;
} {
  switch (period) {
    case 'DAILY':
      return {
        start: startOfDay(date),
        end: endOfDay(date),
        periodDate: startOfDay(date),
      };
    case 'WEEKLY':
      return {
        start: startOfWeek(date, { weekStartsOn: 1 }), // Monday
        end: endOfWeek(date, { weekStartsOn: 1 }),
        periodDate: startOfWeek(date, { weekStartsOn: 1 }),
      };
    case 'MONTHLY':
      return {
        start: startOfMonth(date),
        end: endOfMonth(date),
        periodDate: startOfMonth(date),
      };
    case 'ALL_TIME':
      return {
        start: new Date(0), // Beginning of time
        end: new Date(),
        periodDate: new Date(0),
      };
  }
}

/**
 * Calculate rank change
 *
 * @param previousRank - Previous rank
 * @param currentRank - Current rank
 * @returns Rank change information
 */
export function calculateRankChange(
  previousRank: number | null,
  currentRank: number
): {
  change: number;
  direction: 'up' | 'down' | 'same' | 'new';
  emoji: string;
} {
  if (previousRank === null) {
    return {
      change: 0,
      direction: 'new',
      emoji: '🆕',
    };
  }

  const change = previousRank - currentRank;

  if (change > 0) {
    return {
      change,
      direction: 'up',
      emoji: '⬆️',
    };
  }

  if (change < 0) {
    return {
      change: Math.abs(change),
      direction: 'down',
      emoji: '⬇️',
    };
  }

  return {
    change: 0,
    direction: 'same',
    emoji: '➡️',
  };
}

/**
 * Get rank medal/badge
 *
 * @param rank - User's rank
 * @returns Medal emoji
 */
export function getRankMedal(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '';
  }
}

/**
 * Calculate XP needed to reach next rank
 *
 * @param userXP - User's current XP
 * @param nextRankXP - XP of user in next rank
 * @returns XP difference
 */
export function getXPToNextRank(userXP: number, nextRankXP: number): number {
  return Math.max(0, nextRankXP - userXP);
}

/**
 * Get tier based on rank
 *
 * @param rank - User's rank
 * @param totalUsers - Total number of users
 * @returns Tier information
 */
export function getTierFromRank(
  rank: number,
  totalUsers: number
): {
  tier: string;
  color: string;
  percentile: number;
} {
  const percentile = ((totalUsers - rank + 1) / totalUsers) * 100;

  if (rank <= 10) {
    return {
      tier: 'Legend',
      color: 'text-purple-500',
      percentile,
    };
  }

  if (percentile >= 95) {
    return {
      tier: 'Master',
      color: 'text-red-500',
      percentile,
    };
  }

  if (percentile >= 80) {
    return {
      tier: 'Diamond',
      color: 'text-blue-500',
      percentile,
    };
  }

  if (percentile >= 60) {
    return {
      tier: 'Platinum',
      color: 'text-cyan-500',
      percentile,
    };
  }

  if (percentile >= 40) {
    return {
      tier: 'Gold',
      color: 'text-yellow-500',
      percentile,
    };
  }

  if (percentile >= 20) {
    return {
      tier: 'Silver',
      color: 'text-gray-400',
      percentile,
    };
  }

  return {
    tier: 'Bronze',
    color: 'text-orange-700',
    percentile,
  };
}

/**
 * Sort leaderboard entries
 *
 * @param entries - Array of leaderboard entries
 * @returns Sorted entries with updated ranks
 */
export function sortLeaderboard(
  entries: Omit<LeaderboardEntry, 'rank'>[]
): LeaderboardEntry[] {
  // Sort by XP (descending), then by streak (descending)
  const sorted = [...entries].sort((a, b) => {
    if (b.xp !== a.xp) {
      return b.xp - a.xp;
    }
    return b.streak - a.streak;
  });

  // Assign ranks
  return sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

/**
 * Filter leaderboard to get top N entries
 *
 * @param entries - Leaderboard entries
 * @param limit - Number of top entries to return
 * @returns Top entries
 */
export function getTopEntries(
  entries: LeaderboardEntry[],
  limit: number = 10
): LeaderboardEntry[] {
  return entries.slice(0, limit);
}

/**
 * Get entries around a specific user
 *
 * @param entries - All leaderboard entries
 * @param userId - User ID
 * @param radius - Number of entries above and below
 * @returns Entries around the user
 */
export function getEntriesAroundUser(
  entries: LeaderboardEntry[],
  userId: string,
  radius: number = 5
): {
  entries: LeaderboardEntry[];
  userEntry: LeaderboardEntry | null;
} {
  const userIndex = entries.findIndex((e) => e.userId === userId);

  if (userIndex === -1) {
    return {
      entries: [],
      userEntry: null,
    };
  }

  const start = Math.max(0, userIndex - radius);
  const end = Math.min(entries.length, userIndex + radius + 1);

  return {
    entries: entries.slice(start, end),
    userEntry: entries[userIndex],
  };
}

/**
 * Check if user is in top percentage
 *
 * @param rank - User's rank
 * @param totalUsers - Total number of users
 * @param percentage - Percentage threshold
 * @returns Whether user is in top percentage
 */
export function isInTopPercentage(
  rank: number,
  totalUsers: number,
  percentage: number
): boolean {
  const threshold = Math.ceil((totalUsers * percentage) / 100);
  return rank <= threshold;
}

/**
 * Get congratulatory message based on rank
 *
 * @param rank - User's rank
 * @param totalUsers - Total number of users
 * @returns Congratulatory message
 */
export function getRankMessage(rank: number, totalUsers: number): string {
  if (rank === 1) {
    return "You're #1! Incredible work! 🏆";
  }

  if (rank <= 3) {
    return `Top 3! You're on the podium! ${getRankMedal(rank)}`;
  }

  if (rank <= 10) {
    return "Top 10! You're among the best! ⭐";
  }

  const percentile = ((totalUsers - rank + 1) / totalUsers) * 100;

  if (percentile >= 95) {
    return 'Top 5%! Outstanding performance! 🌟';
  }

  if (percentile >= 75) {
    return 'Top 25%! Keep up the great work! 💪';
  }

  if (percentile >= 50) {
    return 'Top 50%! You're doing great! 👏';
  }

  return 'Keep learning and climbing the ranks! 📚';
}
