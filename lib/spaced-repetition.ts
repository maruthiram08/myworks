/**
 * Spaced Repetition Algorithm - SM-2 (SuperMemo 2)
 *
 * This algorithm calculates the optimal time for reviewing learned material
 * based on the user's performance and previous review history.
 */

export interface ReviewData {
  easeFactor: number; // Difficulty rating (min 1.3)
  interval: number; // Days until next review
  repetitions: number; // Number of successful reviews
}

export interface ReviewResult {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
}

/**
 * Calculate the next review schedule based on performance
 *
 * @param quality - Quality of recall (0-5):
 *   5: Perfect response
 *   4: Correct response after hesitation
 *   3: Correct response with difficulty
 *   2: Incorrect but remembered
 *   1: Incorrect, familiar
 *   0: Complete blackout
 * @param currentData - Current review data
 * @returns New review schedule
 */
export function calculateNextReview(
  quality: number,
  currentData: ReviewData = {
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  }
): ReviewResult {
  let { easeFactor, interval, repetitions } = currentData;

  // Update ease factor based on quality
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  // If quality < 3, reset the interval and repetitions
  if (quality < 3) {
    interval = 1;
    repetitions = 0;
  } else {
    repetitions += 1;

    // Calculate new interval
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewDate,
  };
}

/**
 * Determine the quality score based on user accuracy
 *
 * @param accuracy - Percentage correct (0-100)
 * @param timeSpent - Time spent in seconds
 * @param hintsUsed - Number of hints used
 * @returns Quality score (0-5)
 */
export function determineQuality(
  accuracy: number,
  timeSpent: number,
  hintsUsed: number = 0
): number {
  // Base quality on accuracy
  let quality = 0;

  if (accuracy >= 95) {
    quality = 5;
  } else if (accuracy >= 85) {
    quality = 4;
  } else if (accuracy >= 70) {
    quality = 3;
  } else if (accuracy >= 50) {
    quality = 2;
  } else if (accuracy >= 30) {
    quality = 1;
  } else {
    quality = 0;
  }

  // Adjust for time spent (penalty for taking too long)
  const expectedTime = 60; // 60 seconds baseline
  if (timeSpent > expectedTime * 2) {
    quality = Math.max(0, quality - 1);
  }

  // Adjust for hints (penalty for using hints)
  if (hintsUsed > 0) {
    quality = Math.max(0, quality - hintsUsed);
  }

  return quality;
}

/**
 * Check if a review is due
 *
 * @param nextReviewDate - Scheduled review date
 * @returns True if review is due
 */
export function isReviewDue(nextReviewDate: Date | null): boolean {
  if (!nextReviewDate) return true;
  return new Date() >= nextReviewDate;
}

/**
 * Get lessons that are due for review
 *
 * @param lessons - Array of lessons with review data
 * @returns Filtered array of lessons due for review
 */
export function getDueForReview<T extends { nextReviewDate: Date | null }>(
  lessons: T[]
): T[] {
  return lessons.filter((lesson) => isReviewDue(lesson.nextReviewDate));
}

/**
 * Calculate adaptive difficulty based on recent performance
 *
 * @param recentScores - Array of recent scores (0-100)
 * @returns Difficulty level (1-5)
 */
export function calculateAdaptiveDifficulty(recentScores: number[]): number {
  if (recentScores.length === 0) return 3; // Default medium difficulty

  const averageScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

  if (averageScore >= 90) return 5; // Very hard
  if (averageScore >= 80) return 4; // Hard
  if (averageScore >= 60) return 3; // Medium
  if (averageScore >= 40) return 2; // Easy
  return 1; // Very easy
}

/**
 * Get recommended study time based on performance
 *
 * @param easeFactor - Current ease factor
 * @returns Recommended minutes of study
 */
export function getRecommendedStudyTime(easeFactor: number): number {
  // Higher ease factor = material is easier = less study time needed
  if (easeFactor >= 2.5) return 15;
  if (easeFactor >= 2.0) return 20;
  if (easeFactor >= 1.7) return 25;
  return 30;
}
