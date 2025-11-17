'use client'

import { Lesson, Unit, Language } from "@prisma/client"
import { motion } from "framer-motion"
import Link from "next/link"

interface LessonCompleteProps {
  result: {
    totalXP: number
    accuracy: number
    correctAnswers: number
    totalQuestions: number
    perfectScore: boolean
    leveledUp: boolean
    newLevel: number
    streak: {
      current: number
      increased: boolean
      saved: boolean
    }
    completedQuests: number
  }
  lesson: Lesson & {
    unit: Unit & { language: Language }
  }
  onContinue: () => void
}

export function LessonComplete({ result, lesson, onContinue }: LessonCompleteProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card max-w-2xl w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="text-8xl mb-6"
        >
          {result.perfectScore ? '🏆' : result.accuracy >= 80 ? '⭐' : '✅'}
        </motion.div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {result.perfectScore ? 'Perfect!' : 'Lesson Complete!'}
        </h1>
        <p className="text-gray-600 mb-8">
          {lesson.title} - {lesson.unit.title}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="stat-card from-yellow-400 to-yellow-600"
          >
            <div>
              <div className="text-4xl font-bold">+{result.totalXP}</div>
              <div className="text-sm opacity-90">XP Earned</div>
            </div>
            <span className="text-4xl">⭐</span>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="stat-card from-green-400 to-green-600"
          >
            <div>
              <div className="text-4xl font-bold">{Math.round(result.accuracy)}%</div>
              <div className="text-sm opacity-90">Accuracy</div>
            </div>
            <span className="text-4xl">🎯</span>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="stat-card from-blue-400 to-blue-600"
          >
            <div>
              <div className="text-4xl font-bold">
                {result.correctAnswers}/{result.totalQuestions}
              </div>
              <div className="text-sm opacity-90">Correct</div>
            </div>
            <span className="text-4xl">✅</span>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="stat-card from-orange-400 to-orange-600"
          >
            <div>
              <div className="text-4xl font-bold">{result.streak.current}</div>
              <div className="text-sm opacity-90">Day Streak</div>
            </div>
            <span className="text-4xl">🔥</span>
          </motion.div>
        </div>

        {/* Achievements */}
        <div className="space-y-3 mb-8">
          {result.leveledUp && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
              className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border-2 border-purple-300"
            >
              <div className="text-2xl mb-1">🎊 Level Up!</div>
              <div className="font-bold text-purple-900">
                You reached Level {result.newLevel}!
              </div>
            </motion.div>
          )}

          {result.perfectScore && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
              className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border-2 border-yellow-300"
            >
              <div className="text-2xl mb-1">🏆 Perfect Score!</div>
              <div className="font-bold text-orange-900">
                You answered every question correctly!
              </div>
            </motion.div>
          )}

          {result.streak.increased && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring" }}
              className="p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl border-2 border-orange-300"
            >
              <div className="text-2xl mb-1">
                🔥 {result.streak.saved ? 'Streak Saved!' : 'Streak Extended!'}
              </div>
              <div className="font-bold text-orange-900">
                {result.streak.current} day streak
                {result.streak.saved && ' (Used streak freeze)'}
              </div>
            </motion.div>
          )}

          {result.completedQuests > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.0, type: "spring" }}
              className="p-4 bg-gradient-to-r from-green-100 to-teal-100 rounded-xl border-2 border-green-300"
            >
              <div className="text-2xl mb-1">🎯 Quests Completed!</div>
              <div className="font-bold text-green-900">
                You completed {result.completedQuests} quest{result.completedQuests > 1 ? 's' : ''}!
              </div>
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onContinue}
            className="btn-primary flex-1"
          >
            Continue Learning
          </button>
          <Link
            href="/dashboard"
            className="btn-secondary flex-1 text-center"
          >
            View Progress
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
