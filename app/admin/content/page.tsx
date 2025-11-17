'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import { QuestionType, DifficultyLevel } from "@prisma/client"

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState('languages')
  const [languages, setLanguages] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  const [challenges, setChallenges] = useState<any[]>([])
  const [questions, setQuestions] = useState<any[]>([])

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [langRes, unitsRes, lessonsRes, challengesRes, questionsRes] = await Promise.all([
        fetch('/api/admin/languages'),
        fetch('/api/admin/units'),
        fetch('/api/admin/lessons'),
        fetch('/api/admin/challenges'),
        fetch('/api/admin/questions'),
      ])

      setLanguages(await langRes.json())
      setUnits(await unitsRes.json())
      setLessons(await lessonsRes.json())
      setChallenges(await challengesRes.json())
      setQuestions(await questionsRes.json())
    } catch (error) {
      toast.error('Failed to load data')
    }
  }

  const tabs = [
    { id: 'languages', label: 'Languages', icon: '🌐' },
    { id: 'units', label: 'Units', icon: '📚' },
    { id: 'lessons', label: 'Lessons', icon: '📖' },
    { id: 'challenges', label: 'Challenges', icon: '🎯' },
    { id: 'questions', label: 'Questions', icon: '❓' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
              <p className="text-sm text-gray-600">Manage all learning content</p>
            </div>
            <Link href="/admin" className="btn-secondary">
              ← Back to Admin
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'languages' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Languages ({languages.length})</h2>
              <Link href="/admin/languages" className="btn-primary">
                Manage Languages
              </Link>
            </div>
            <div className="grid gap-4">
              {languages.map(lang => (
                <div key={lang.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{lang.flag}</span>
                    <div>
                      <div className="font-bold">{lang.name}</div>
                      <div className="text-sm text-gray-600">{lang.code}</div>
                    </div>
                    <span className={`ml-auto px-2 py-1 text-xs rounded ${
                      lang.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {lang.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'units' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Units ({units.length})</h2>
            </div>
            <div className="grid gap-4">
              {units.map(unit => (
                <div key={unit.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold">{unit.title}</div>
                      <div className="text-sm text-gray-600">{unit.language.name} - Order: {unit.order}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {unit._count.lessons} lessons
                      </div>
                    </div>
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: unit.color }}
                    >
                      {unit.order}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Lessons ({lessons.length})</h2>
            </div>
            <div className="grid gap-4">
              {lessons.map(lesson => (
                <div key={lesson.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="font-bold">{lesson.title}</div>
                  <div className="text-sm text-gray-600">
                    {lesson.unit.language.name} → {lesson.unit.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {lesson._count.challenges} challenges
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Challenges ({challenges.length})</h2>
            </div>
            <div className="grid gap-4">
              {challenges.map(challenge => (
                <div key={challenge.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="font-bold">Challenge #{challenge.order}</div>
                  <div className="text-sm text-gray-600">
                    {challenge.lesson.unit.language.name} → {challenge.lesson.unit.title} → {challenge.lesson.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {challenge._count.questions} questions
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Questions ({questions.length})</h2>
            </div>
            <div className="grid gap-4">
              {questions.map(question => (
                <div key={question.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{question.prompt}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {question.challenge.lesson.unit.language.name} → {question.challenge.lesson.title}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {question.type}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                          {question.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">
                          {question.points} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
