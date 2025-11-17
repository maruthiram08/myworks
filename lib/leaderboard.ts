/**
 * Leaderboard and ranking system
 */

export interface LeaderboardEntry {
  userId: string
  name: string | null
  image: string | null
  xp: number
  level: number
  rank: number
  streakDays: number
}

export interface LeaderboardFilters {
  period?: 'daily' | 'weekly' | 'monthly' | 'all-time'
  limit?: number
  offset?: number
}

/**
 * Calculate user's rank based on XP
 */
export function getRankFromXP(xp: number): {
  rank: string
  nextRank: string
  xpNeeded: number
  color: string
} {
  const ranks = [
    { name: 'Bronze', minXP: 0, color: '#CD7F32', next: 'Silver' },
    { name: 'Silver', minXP: 500, color: '#C0C0C0', next: 'Gold' },
    { name: 'Gold', minXP: 1500, color: '#FFD700', next: 'Platinum' },
    { name: 'Platinum', minXP: 3000, color: '#E5E4E2', next: 'Diamond' },
    { name: 'Diamond', minXP: 5000, color: '#B9F2FF', next: 'Master' },
    { name: 'Master', minXP: 10000, color: '#9D00FF', next: 'Grandmaster' },
    { name: 'Grandmaster', minXP: 20000, color: '#FF4500', next: 'Legend' },
    { name: 'Legend', minXP: 50000, color: '#FFD700', next: 'Legend' },
  ]

  let currentRank = ranks[0]
  let nextRank = ranks[1]

  for (let i = 0; i < ranks.length; i++) {
    if (xp >= ranks[i].minXP) {
      currentRank = ranks[i]
      nextRank = i < ranks.length - 1 ? ranks[i + 1] : ranks[i]
    } else {
      break
    }
  }

  return {
    rank: currentRank.name,
    nextRank: nextRank.name,
    xpNeeded: nextRank.minXP - xp,
    color: currentRank.color,
  }
}

/**
 * Calculate leaderboard position change emoji
 */
export function getPositionChangeEmoji(change: number): string {
  if (change > 0) return '📈'
  if (change < 0) return '📉'
  return '➡️'
}

/**
 * Get league/division based on XP percentile
 */
export function getLeague(percentile: number): {
  name: string
  color: string
  icon: string
} {
  if (percentile >= 99) {
    return { name: 'Diamond League', color: '#B9F2FF', icon: '💎' }
  } else if (percentile >= 90) {
    return { name: 'Obsidian League', color: '#3C1361', icon: '🖤' }
  } else if (percentile >= 70) {
    return { name: 'Pearl League', color: '#F0EAD6', icon: '🤍' }
  } else if (percentile >= 50) {
    return { name: 'Gold League', color: '#FFD700', icon: '🏆' }
  } else if (percentile >= 30) {
    return { name: 'Silver League', color: '#C0C0C0', icon: '🥈' }
  } else {
    return { name: 'Bronze League', color: '#CD7F32', icon: '🥉' }
  }
}

/**
 * Get weekly leaderboard cutoff (Monday at 00:00)
 */
export function getWeeklyLeaderboardCutoff(): Date {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Monday = 0
  const monday = new Date(now)
  monday.setDate(monday.getDate() - diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

/**
 * Get monthly leaderboard cutoff (1st of month at 00:00)
 */
export function getMonthlyLeaderboardCutoff(): Date {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  firstDay.setHours(0, 0, 0, 0)
  return firstDay
}
