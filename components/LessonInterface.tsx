'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Lesson, Unit, Language, Challenge, Question } from "@prisma/client"
import { QuestionCard } from "./QuestionCard"
import { LessonComplete } from "./LessonComplete"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import Confetti from "react-confetti"

interface LessonInterfaceProps {
  lesson: Lesson & {
    unit: Unit & { language: Language }
    challenges: (Challenge & { questions: Question[] })[]
  }
  user: User
}

interface Answer {
  questionId: string
  challengeId: string
  answer: string
  timeSpent: number
  hintsUsed: number
  isCorrect?: boolean
}

export function LessonInterface({ lesson, user }: LessonInterfaceProps) {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [hearts, setHearts] = useState(user.hearts)
  const [isComplete, setIsComplete] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())
  const [hintsUsed, setHintsUsed] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [lessonResult, setLessonResult] = useState<any>(null)

  // Flatten all questions from all challenges
  const allQuestions = lesson.challenges.flatMap((challenge) =>
    challenge.questions.map((question) => ({
      ...question,
      challengeId: challenge.id,
    }))
  )

  const currentQuestion = allQuestions[currentQuestionIndex]
  const totalQuestions = allQuestions.length
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  useEffect(() => {
    setStartTime(Date.now())
    setHintsUsed(0)
  }, [currentQuestionIndex])

  const handleAnswer = async (answer: string, isCorrect: boolean) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      challengeId: currentQuestion.challengeId,
      answer,
      timeSpent,
      hintsUsed,
      isCorrect,
    }

    setAnswers([...answers, newAnswer])

    if (!isCorrect) {
      const newHearts = Math.max(0, hearts - 1)
      setHearts(newHearts)

      if (newHearts === 0) {
        toast.error("Out of hearts! Lesson failed.")
        setTimeout(() => {
          router.push("/learn")
        }, 2000)
        return
      }
    }

    // Move to next question or complete lesson
    if (currentQuestionIndex < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      }, 1000)
    } else {
      // Submit lesson
      await submitLesson([...answers, newAnswer])
    }
  }

  const handleHint = () => {
    setHintsUsed(hintsUsed + 1)
    toast('Hint used! This will reduce your score.', { icon: '💡' })
  }

  const submitLesson = async (finalAnswers: Answer[]) => {
    try {
      setSubmitting(true)
      const response = await fetch(`/api/lessons/${lesson.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers }),
      })

      if (!response.ok) throw new Error('Failed to submit lesson')

      const result = await response.json()
      setLessonResult(result)
      setIsComplete(true)

      if (result.perfectScore || result.leveledUp) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 5000)
      }
    } catch (error) {
      toast.error('Failed to submit lesson')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  if (isComplete && lessonResult) {
    return (
      <>
        {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
        <LessonComplete
          result={lessonResult}
          lesson={lesson}
          onContinue={() => router.push("/learn")}
        />
      </>
    )
  }

  if (submitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📊</div>
          <div className="text-2xl font-bold text-gray-900">
            Calculating your score...
          </div>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-2xl font-bold text-gray-900">
            No questions available
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
                  router.push('/learn')
                }
              }}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="text-2xl">❌</span>
            </button>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {[...Array(Math.max(hearts, 0))].map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-2xl"
                  >
                    ❤️
                  </motion.span>
                ))}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            ></motion.div>
          </div>

          <div className="text-sm text-gray-600 mt-2 text-center">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <QuestionCard
              question={currentQuestion}
              onAnswer={handleAnswer}
              onHint={handleHint}
              soundEnabled={user.soundEnabled}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
