'use client'

import { UserAnswer } from "@prisma/client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays } from 'date-fns'

interface ProgressChartProps {
  answers: UserAnswer[]
}

export function ProgressChart({ answers }: ProgressChartProps) {
  // Group answers by day for the last 7 days
  const data = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dayAnswers = answers.filter(
      (a) => format(new Date(a.createdAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    )
    const correctAnswers = dayAnswers.filter((a) => a.isCorrect).length
    const accuracy = dayAnswers.length > 0
      ? (correctAnswers / dayAnswers.length) * 100
      : 0

    return {
      date: format(date, 'MMM dd'),
      accuracy: Math.round(accuracy),
      total: dayAnswers.length,
    }
  })

  return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#22c55e"
            strokeWidth={3}
            dot={{ fill: '#22c55e', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="text-center text-sm text-gray-600 mt-2">
        Last 7 days accuracy
      </div>
    </div>
  )
}
