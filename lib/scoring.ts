/**
 * Scoring and XP Calculation System
 *
 * Handles all XP calculations, scoring logic, and reward systems
 */

export interface LessonScore {
  baseXP: number;
  accuracyBonus: number;
  speedBonus: number;
  streakMultiplier: number;
  perfectBonus: number;
  totalXP: number;
  heartsLost: number;
  accuracy: number;
  isPerfect: boolean;
}

export interface QuestionScore {
  isCorrect: boolean;
  points: number;
  timeBonus: number;
  streak: number;
}

/**
 * Calculate XP earned for completing a lesson
 *
 * @param correctAnswers - Number of correct answers
 * @param totalQuestions - Total number of questions
 * @param timeSpent - Time spent in seconds
 * @param heartsLost - Number of hearts lost
 * @param currentStreak - Current learning streak
 * @returns Detailed score breakdown
 */
export function calculateLessonXP(
  correctAnswers: number,
  totalQuestions: number,
  timeSpent: number,
  heartsLost: number = 0,
  currentStreak: number = 0
): LessonScore {
  const accuracy = (correctAnswers / totalQuestions) * 100;
  const baseXP = 10; // Base XP for completing a lesson

  // Accuracy bonus (0-10 XP)
  let accuracyBonus = 0;
  if (accuracy === 100) {
    accuracyBonus = 10;
  } else if (accuracy >= 90) {
    accuracyBonus = 7;
  } else if (accuracy >= 80) {
    accuracyBonus = 5;
  } else if (accuracy >= 70) {
    accuracyBonus = 3;
  }

  // Speed bonus (0-5 XP)
  // Expected time: 30 seconds per question
  const expectedTime = totalQuestions * 30;
  let speedBonus = 0;
  if (timeSpent < expectedTime * 0.5) {
    speedBonus = 5;
  } else if (timeSpent < expectedTime * 0.75) {
    speedBonus = 3;
  } else if (timeSpent < expectedTime) {
    speedBonus = 1;
  }

  // Streak multiplier (1x - 2x)
  let streakMultiplier = 1;
  if (currentStreak >= 30) {
    streakMultiplier = 2.0;
  } else if (currentStreak >= 14) {
    streakMultiplier = 1.75;
  } else if (currentStreak >= 7) {
    streakMultiplier = 1.5;
  } else if (currentStreak >= 3) {
    streakMultiplier = 1.25;
  }

  // Perfect lesson bonus (no hearts lost)
  const perfectBonus = heartsLost === 0 && accuracy === 100 ? 15 : 0;
  const isPerfect = heartsLost === 0 && accuracy === 100;

  // Calculate total XP
  const subtotal = baseXP + accuracyBonus + speedBonus;
  const totalXP = Math.floor(subtotal * streakMultiplier + perfectBonus);

  return {
    baseXP,
    accuracyBonus,
    speedBonus,
    streakMultiplier,
    perfectBonus,
    totalXP,
    heartsLost,
    accuracy,
    isPerfect,
  };
}

/**
 * Calculate points for a single question
 *
 * @param isCorrect - Whether the answer was correct
 * @param timeSpent - Time spent in seconds
 * @param questionStreak - Current streak of correct answers in lesson
 * @param difficulty - Question difficulty (1-5)
 * @returns Question score details
 */
export function calculateQuestionScore(
  isCorrect: boolean,
  timeSpent: number,
  questionStreak: number = 0,
  difficulty: number = 1
): QuestionScore {
  if (!isCorrect) {
    return {
      isCorrect: false,
      points: 0,
      timeBonus: 0,
      streak: 0,
    };
  }

  // Base points adjusted by difficulty
  const basePoints = 10 * difficulty;

  // Time bonus (faster = more points)
  let timeBonus = 0;
  if (timeSpent < 5) {
    timeBonus = 5;
  } else if (timeSpent < 10) {
    timeBonus = 3;
  } else if (timeSpent < 15) {
    timeBonus = 1;
  }

  // Streak bonus within the lesson
  const streakBonus = Math.min(questionStreak * 2, 20);

  const points = basePoints + timeBonus + streakBonus;

  return {
    isCorrect: true,
    points,
    timeBonus,
    streak: questionStreak,
  };
}

/**
 * Calculate hearts to deduct for an incorrect answer
 *
 * @param difficulty - Question difficulty (1-5)
 * @param consecutiveErrors - Number of consecutive errors
 * @returns Hearts to deduct
 */
export function calculateHeartLoss(
  difficulty: number = 1,
  consecutiveErrors: number = 0
): number {
  // Harder questions cost fewer hearts (to encourage trying difficult content)
  let hearts = Math.max(1, 3 - difficulty);

  // Reduce heart loss for consecutive errors (be forgiving)
  if (consecutiveErrors >= 3) {
    hearts = Math.max(1, hearts - 1);
  }

  return hearts;
}

/**
 * Calculate gem rewards
 *
 * @param isPerfectLesson - Whether the lesson was completed perfectly
 * @param isFirstTime - Whether this is the first time completing the lesson
 * @param streakMilestone - Streak milestone reached (e.g., 7, 14, 30 days)
 * @returns Gems earned
 */
export function calculateGemReward(
  isPerfectLesson: boolean = false,
  isFirstTime: boolean = false,
  streakMilestone: number = 0
): number {
  let gems = 0;

  if (isPerfectLesson) {
    gems += 5;
  }

  if (isFirstTime) {
    gems += 10;
  }

  // Streak milestones
  if (streakMilestone === 7) {
    gems += 20;
  } else if (streakMilestone === 14) {
    gems += 50;
  } else if (streakMilestone === 30) {
    gems += 100;
  } else if (streakMilestone === 60) {
    gems += 200;
  } else if (streakMilestone === 100) {
    gems += 500;
  }

  return gems;
}

/**
 * Calculate rank based on XP
 *
 * @param xp - Total XP
 * @returns Rank information
 */
export function calculateRank(xp: number): {
  rank: string;
  icon: string;
  minXP: number;
  maxXP: number;
} {
  if (xp >= 50000) {
    return { rank: 'Diamond', icon: '💎', minXP: 50000, maxXP: Infinity };
  }
  if (xp >= 25000) {
    return { rank: 'Platinum', icon: '🏆', minXP: 25000, maxXP: 49999 };
  }
  if (xp >= 10000) {
    return { rank: 'Gold', icon: '🥇', minXP: 10000, maxXP: 24999 };
  }
  if (xp >= 5000) {
    return { rank: 'Silver', icon: '🥈', minXP: 5000, maxXP: 9999 };
  }
  if (xp >= 1000) {
    return { rank: 'Bronze', icon: '🥉', minXP: 1000, maxXP: 4999 };
  }
  return { rank: 'Beginner', icon: '🌱', minXP: 0, maxXP: 999 };
}

/**
 * Check if user leveled up and calculate rewards
 *
 * @param oldXP - XP before the lesson
 * @param newXP - XP after the lesson
 * @returns Level up information
 */
export function checkLevelUp(
  oldXP: number,
  newXP: number
): {
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  gemReward: number;
} {
  const oldLevel = Math.floor(Math.sqrt(oldXP / 100)) + 1;
  const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;

  const leveledUp = newLevel > oldLevel;
  const levelDifference = newLevel - oldLevel;

  // Gem reward for leveling up
  const gemReward = leveledUp ? levelDifference * 25 : 0;

  return {
    leveledUp,
    oldLevel,
    newLevel,
    gemReward,
  };
}

/**
 * Calculate daily quest progress
 *
 * @param questType - Type of quest
 * @param value - Value to add (lessons completed, XP earned, etc.)
 * @param currentProgress - Current progress
 * @param target - Target value
 * @returns Updated progress and completion status
 */
export function updateQuestProgress(
  questType: string,
  value: number,
  currentProgress: number,
  target: number
): {
  newProgress: number;
  completed: boolean;
  percentComplete: number;
} {
  const newProgress = Math.min(currentProgress + value, target);
  const completed = newProgress >= target;
  const percentComplete = (newProgress / target) * 100;

  return {
    newProgress,
    completed,
    percentComplete,
  };
}
