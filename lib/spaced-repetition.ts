/**
 * Spaced Repetition System using SM-2 Algorithm
 * https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm
 */

export interface ReviewResult {
  easeFactor: number
  interval: number
  repetitions: number
  nextReview: Date
}

export enum PerformanceRating {
  AGAIN = 0,       // Complete blackout
  HARD = 1,        // Incorrect response but remembered
  GOOD = 2,        // Correct response with hesitation
  EASY = 3,        // Perfect response
}

/**
 * Calculate next review based on SM-2 algorithm
 * @param quality - Performance rating (0-3)
 * @param easeFactor - Current ease factor (default 2.5)
 * @param interval - Current interval in days (default 1)
 * @param repetitions - Number of consecutive correct responses (default 0)
 */
export function calculateNextReview(
  quality: PerformanceRating,
  easeFactor: number = 2.5,
  interval: number = 1,
  repetitions: number = 0
): ReviewResult {
  let newEaseFactor = easeFactor
  let newInterval = interval
  let newRepetitions = repetitions

  // Update ease factor
  newEaseFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02))
  )

  // Calculate new interval
  if (quality < PerformanceRating.GOOD) {
    // Reset if answer was incorrect
    newRepetitions = 0
    newInterval = 1
  } else {
    newRepetitions += 1

    if (newRepetitions === 1) {
      newInterval = 1
    } else if (newRepetitions === 2) {
      newInterval = 6
    } else {
      newInterval = Math.round(interval * newEaseFactor)
    }
  }

  // Calculate next review date
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + newInterval)

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReview,
  }
}

/**
 * Determine performance rating based on answer correctness and time spent
 * @param isCorrect - Whether the answer was correct
 * @param timeSpent - Time spent on question in seconds
 * @param avgTime - Average time for this difficulty level
 * @param hintsUsed - Number of hints used
 */
export function getPerformanceRating(
  isCorrect: boolean,
  timeSpent: number,
  avgTime: number = 30,
  hintsUsed: number = 0
): PerformanceRating {
  if (!isCorrect) {
    return PerformanceRating.AGAIN
  }

  if (hintsUsed > 0 || timeSpent > avgTime * 1.5) {
    return PerformanceRating.HARD
  }

  if (timeSpent <= avgTime * 0.5) {
    return PerformanceRating.EASY
  }

  return PerformanceRating.GOOD
}

/**
 * Get questions that need review based on spaced repetition schedule
 */
export function shouldReview(nextReviewDate: Date | null): boolean {
  if (!nextReviewDate) return true
  return new Date() >= new Date(nextReviewDate)
}
