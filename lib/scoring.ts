/**
 * Scoring and XP calculation system
 */

import { DifficultyLevel, QuestionType } from "@prisma/client"

export interface ScoreResult {
  basePoints: number
  bonusPoints: number
  totalPoints: number
  xpEarned: number
}

/**
 * Base points for each difficulty level
 */
const DIFFICULTY_POINTS: Record<DifficultyLevel, number> = {
  BEGINNER: 10,
  INTERMEDIATE: 20,
  ADVANCED: 30,
  EXPERT: 50,
}

/**
 * Question type multipliers
 */
const QUESTION_TYPE_MULTIPLIERS: Record<QuestionType, number> = {
  MULTIPLE_CHOICE: 1.0,
  TEXT_INPUT: 1.2,
  AUDIO: 1.3,
  IMAGE_SELECT: 1.1,
  MATCH_PAIRS: 1.4,
  FILL_BLANK: 1.2,
}

/**
 * Calculate score for answering a question
 */
export function calculateScore(
  difficulty: DifficultyLevel,
  questionType: QuestionType,
  isCorrect: boolean,
  timeSpent: number,
  avgTime: number = 30,
  hintsUsed: number = 0,
  isFirstAttempt: boolean = true
): ScoreResult {
  if (!isCorrect) {
    return {
      basePoints: 0,
      bonusPoints: 0,
      totalPoints: 0,
      xpEarned: 0,
    }
  }

  // Calculate base points
  const basePoints = DIFFICULTY_POINTS[difficulty] * QUESTION_TYPE_MULTIPLIERS[questionType]

  let bonusPoints = 0

  // Speed bonus (up to 50% bonus for being fast)
  if (timeSpent < avgTime) {
    const speedRatio = 1 - (timeSpent / avgTime)
    bonusPoints += Math.floor(basePoints * speedRatio * 0.5)
  }

  // First attempt bonus (25% bonus)
  if (isFirstAttempt) {
    bonusPoints += Math.floor(basePoints * 0.25)
  }

  // Penalty for using hints
  const hintPenalty = Math.min(hintsUsed * 5, basePoints * 0.3)
  bonusPoints -= hintPenalty

  // Ensure bonus doesn't go negative
  bonusPoints = Math.max(0, bonusPoints)

  const totalPoints = Math.floor(basePoints + bonusPoints)
  const xpEarned = totalPoints // 1:1 ratio for XP

  return {
    basePoints: Math.floor(basePoints),
    bonusPoints: Math.floor(bonusPoints),
    totalPoints,
    xpEarned,
  }
}

/**
 * Calculate user level based on XP
 * Uses exponential growth: XP needed = 100 * (level ^ 1.5)
 */
export function calculateLevel(xp: number): number {
  let level = 1
  let xpNeeded = 0

  while (xp >= xpNeeded) {
    level++
    xpNeeded += Math.floor(100 * Math.pow(level, 1.5))
  }

  return level - 1
}

/**
 * Calculate XP needed for next level
 */
export function xpForNextLevel(currentLevel: number): number {
  return Math.floor(100 * Math.pow(currentLevel + 1, 1.5))
}

/**
 * Calculate XP progress to next level as percentage
 */
export function getXPProgress(xp: number, currentLevel: number): number {
  const currentLevelXP = currentLevel === 1 ? 0 : Math.floor(100 * Math.pow(currentLevel, 1.5))
  const nextLevelXP = Math.floor(100 * Math.pow(currentLevel + 1, 1.5))
  const xpInCurrentLevel = xp - currentLevelXP
  const xpNeededForLevel = nextLevelXP - currentLevelXP

  return Math.floor((xpInCurrentLevel / xpNeededForLevel) * 100)
}

/**
 * Calculate hearts lost on wrong answer
 */
export function calculateHeartsLost(difficulty: DifficultyLevel): number {
  const heartsMap: Record<DifficultyLevel, number> = {
    BEGINNER: 1,
    INTERMEDIATE: 1,
    ADVANCED: 2,
    EXPERT: 2,
  }

  return heartsMap[difficulty]
}

/**
 * Calculate lesson completion bonus
 */
export function calculateLessonCompletionBonus(
  accuracy: number,
  totalQuestions: number,
  perfectScore: boolean
): number {
  let bonus = totalQuestions * 5 // Base bonus: 5 XP per question

  // Perfect score bonus (50% extra)
  if (perfectScore) {
    bonus += Math.floor(bonus * 0.5)
  }

  // High accuracy bonus (25% extra for >90% accuracy)
  if (accuracy >= 90) {
    bonus += Math.floor(bonus * 0.25)
  }

  return Math.floor(bonus)
}
