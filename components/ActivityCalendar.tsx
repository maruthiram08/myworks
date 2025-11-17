'use client'

import { UserAnswer } from "@prisma/client"
import { format, subDays, startOfDay } from 'date-fns'

interface ActivityCalendarProps {
  answers: UserAnswer[]
}

export function ActivityCalendar({ answers }: ActivityCalendarProps) {
  // Last 30 days of activity
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i)
    const dayStart = startOfDay(date)
    const dayAnswers = answers.filter(
      (a) => {
        const answerDate = startOfDay(new Date(a.createdAt))
        return answerDate.getTime() === dayStart.getTime()
      }
    )

    return {
      date,
      count: dayAnswers.length,
      label: format(date, 'MMM d'),
    }
  })

  const maxCount = Math.max(...days.map(d => d.count), 1)

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-gray-100'
    const ratio = count / maxCount
    if (ratio < 0.25) return 'bg-primary-200'
    if (ratio < 0.5) return 'bg-primary-400'
    if (ratio < 0.75) return 'bg-primary-600'
    return 'bg-primary-800'
  }

  return (
    <div>
      <div className="grid grid-cols-10 gap-1">
        {days.map((day, i) => (
          <div
            key={i}
            className={`
              aspect-square rounded ${getIntensity(day.count)}
              transition-all hover:scale-110 cursor-pointer
              flex items-center justify-center text-xs
              ${day.count > 0 ? 'text-white font-semibold' : 'text-gray-400'}
            `}
            title={`${day.label}: ${day.count} questions`}
          >
            {day.count > 0 && day.count}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
        <span>Less active</span>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded bg-gray-100"></div>
          <div className="w-3 h-3 rounded bg-primary-200"></div>
          <div className="w-3 h-3 rounded bg-primary-400"></div>
          <div className="w-3 h-3 rounded bg-primary-600"></div>
          <div className="w-3 h-3 rounded bg-primary-800"></div>
        </div>
        <span>More active</span>
      </div>
    </div>
  )
}
