import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateScore, calculateLevel, calculateLessonCompletionBonus } from "@/lib/scoring"
import { updateStreak } from "@/lib/streak"
import { calculateNextReview, getPerformanceRating } from "@/lib/spaced-repetition"
import { updateQuestProgress } from "@/lib/quests"
import { QuestType } from "@prisma/client"

export async function POST(
  request: Request,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { answers } = body // Array of { questionId, challengeId, answer, timeSpent, hintsUsed }

    // Fetch lesson with challenges and questions
    const lesson = await prisma.lesson.findUnique({
      where: { id: params.lessonId },
      include: {
        challenges: {
          include: {
            questions: true,
          },
        },
      },
    })

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    // Calculate scores and save answers
    let totalXP = 0
    let correctAnswers = 0
    const totalQuestions = answers.length
    const userAnswers = []

    for (const answer of answers) {
      const question = lesson.challenges
        .flatMap(c => c.questions)
        .find(q => q.id === answer.questionId)

      if (!question) continue

      // Check if answer is correct
      const isCorrect = answer.answer.toLowerCase().trim() ===
                       question.correctAnswer.toLowerCase().trim()

      if (isCorrect) correctAnswers++

      // Calculate score
      const score = calculateScore(
        question.difficulty,
        question.type,
        isCorrect,
        answer.timeSpent,
        30, // average time
        answer.hintsUsed,
        true // first attempt
      )

      totalXP += score.xpEarned

      // Save user answer
      userAnswers.push({
        userId: session.user.id,
        challengeId: answer.challengeId,
        questionId: answer.questionId,
        answer: answer.answer,
        isCorrect,
        timeSpent: answer.timeSpent,
        hintsUsed: answer.hintsUsed,
      })
    }

    const accuracy = (correctAnswers / totalQuestions) * 100
    const perfectScore = accuracy === 100

    // Lesson completion bonus
    const completionBonus = calculateLessonCompletionBonus(
      accuracy,
      totalQuestions,
      perfectScore
    )
    totalXP += completionBonus

    // Update user XP and level
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const newXP = user.xp + totalXP
    const newLevel = calculateLevel(newXP)
    const leveledUp = newLevel > user.level

    // Get existing progress or create new
    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: params.lessonId,
        },
      },
    })

    // Calculate spaced repetition
    const performanceRating = getPerformanceRating(
      perfectScore,
      answers.reduce((sum: number, a: any) => sum + a.timeSpent, 0) / totalQuestions,
      30,
      answers.reduce((sum: number, a: any) => sum + a.hintsUsed, 0)
    )

    const reviewData = calculateNextReview(
      performanceRating,
      existingProgress?.easeFactor || 2.5,
      existingProgress?.interval || 1,
      existingProgress?.repetitions || 0
    )

    // Update streak
    const streak = await prisma.streak.findUnique({
      where: { userId: session.user.id },
    })

    let streakData = {
      currentStreak: 1,
      longestStreak: 1,
      frozenDays: 0,
      streakIncreased: true,
      streakSaved: false,
    }

    if (streak) {
      streakData = updateStreak(
        streak.currentStreak,
        streak.longestStreak,
        streak.lastActivity,
        user.timezone,
        streak.frozenDays
      )
    }

    // Update quests
    const userQuests = await prisma.userQuest.findMany({
      where: {
        userId: session.user.id,
        completed: false,
      },
      include: {
        quest: true,
      },
    })

    const questUpdates = []
    for (const userQuest of userQuests) {
      const newProgress = updateQuestProgress(
        userQuest.quest.type,
        userQuest.progress,
        {
          lessonsCompleted: 1,
          xpEarned: totalXP,
          perfectScores: perfectScore ? 1 : 0,
          streakMaintained: streakData.streakIncreased,
        }
      )

      const isCompleted = newProgress >= userQuest.quest.target

      questUpdates.push({
        id: userQuest.id,
        progress: newProgress,
        completed: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      })
    }

    // Execute all updates in a transaction
    const result = await prisma.$transaction([
      // Save user answers
      prisma.userAnswer.createMany({
        data: userAnswers,
      }),

      // Update or create progress
      prisma.userProgress.upsert({
        where: {
          userId_lessonId: {
            userId: session.user.id,
            lessonId: params.lessonId,
          },
        },
        update: {
          completed: true,
          score: totalXP,
          accuracy,
          attempts: (existingProgress?.attempts || 0) + 1,
          lastReviewed: new Date(),
          nextReview: reviewData.nextReview,
          easeFactor: reviewData.easeFactor,
          interval: reviewData.interval,
          repetitions: reviewData.repetitions,
        },
        create: {
          userId: session.user.id,
          lessonId: params.lessonId,
          completed: true,
          score: totalXP,
          accuracy,
          attempts: 1,
          lastReviewed: new Date(),
          nextReview: reviewData.nextReview,
          easeFactor: reviewData.easeFactor,
          interval: reviewData.interval,
          repetitions: reviewData.repetitions,
        },
      }),

      // Update user XP and level
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          xp: newXP,
          level: newLevel,
        },
      }),

      // Update streak
      prisma.streak.upsert({
        where: { userId: session.user.id },
        update: {
          currentStreak: streakData.currentStreak,
          longestStreak: streakData.longestStreak,
          lastActivity: new Date(),
          frozenDays: streakData.frozenDays,
        },
        create: {
          userId: session.user.id,
          currentStreak: streakData.currentStreak,
          longestStreak: streakData.longestStreak,
          lastActivity: new Date(),
          frozenDays: streakData.frozenDays,
        },
      }),

      // Update quests
      ...questUpdates.map(update =>
        prisma.userQuest.update({
          where: { id: update.id },
          data: {
            progress: update.progress,
            completed: update.completed,
            completedAt: update.completedAt,
          },
        })
      ),
    ])

    return NextResponse.json({
      success: true,
      totalXP,
      accuracy,
      correctAnswers,
      totalQuestions,
      perfectScore,
      leveledUp,
      newLevel,
      streak: {
        current: streakData.currentStreak,
        increased: streakData.streakIncreased,
        saved: streakData.streakSaved,
      },
      completedQuests: questUpdates.filter(q => q.completed).length,
    })
  } catch (error) {
    console.error('Error submitting lesson:', error)
    return NextResponse.json(
      { error: 'Failed to submit lesson' },
      { status: 500 }
    )
  }
}
