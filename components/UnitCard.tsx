'use client'

import { Unit, Lesson, UserProgress } from "@prisma/client"
import Link from "next/link"

interface UnitCardProps {
  unit: Unit & {
    lessons: (Lesson & {
      progress: UserProgress[]
    })[]
  }
  userId: string
}

export function UnitCard({ unit, userId }: UnitCardProps) {
  const totalLessons = unit.lessons.length
  const completedLessons = unit.lessons.filter(
    (lesson) => lesson.progress.length > 0 && lesson.progress[0].completed
  ).length
  const progressPercentage = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {unit.title}
          </h3>
          {unit.description && (
            <p className="text-gray-600 text-sm">{unit.description}</p>
          )}
        </div>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
          style={{ backgroundColor: unit.color }}
        >
          {unit.order}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">
            {completedLessons} / {totalLessons} lessons
          </span>
          <span className="font-semibold text-primary-600">
            {progressPercentage}%
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {unit.lessons.map((lesson, index) => {
          const isCompleted = lesson.progress.length > 0 && lesson.progress[0].completed
          const isLocked = unit.isLocked || (index > 0 && !unit.lessons[index - 1].progress[0]?.completed)
          const accuracy = lesson.progress[0]?.accuracy || 0

          return (
            <Link
              key={lesson.id}
              href={isLocked ? '#' : `/lesson/${lesson.id}`}
              className={`
                lesson-card
                ${isLocked ? 'lesson-card-locked' : ''}
                ${isCompleted ? 'border-primary-500' : ''}
              `}
            >
              <div className="p-4">
                {/* Status Icon */}
                <div className="text-center mb-2">
                  {isLocked ? (
                    <span className="text-3xl">🔒</span>
                  ) : isCompleted ? (
                    <span className="text-3xl">
                      {accuracy === 100 ? '⭐' : '✅'}
                    </span>
                  ) : (
                    <span className="text-3xl">📝</span>
                  )}
                </div>

                {/* Lesson Info */}
                <div className="text-center">
                  <div className="font-semibold text-sm text-gray-900 truncate">
                    {lesson.title}
                  </div>
                  {isCompleted && (
                    <div className="text-xs text-primary-600 mt-1">
                      {Math.round(accuracy)}%
                    </div>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
