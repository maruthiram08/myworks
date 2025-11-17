'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Link from "next/link"

interface Language {
  id: string
  name: string
  code: string
  flag: string
  description: string | null
  isActive: boolean
  _count: {
    units: number
  }
}

export default function AdminLanguagesPage() {
  const router = useRouter()
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    flag: '',
    description: '',
    isActive: true,
  })

  useEffect(() => {
    fetchLanguages()
  }, [])

  const fetchLanguages = async () => {
    try {
      const response = await fetch('/api/admin/languages')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setLanguages(data)
    } catch (error) {
      toast.error('Failed to load languages')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingId
        ? `/api/admin/languages/${editingId}`
        : '/api/admin/languages'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to save')

      toast.success(editingId ? 'Language updated!' : 'Language created!')
      setShowForm(false)
      setEditingId(null)
      setFormData({ name: '', code: '', flag: '', description: '', isActive: true })
      fetchLanguages()
    } catch (error) {
      toast.error('Failed to save language')
    }
  }

  const handleEdit = (language: Language) => {
    setFormData({
      name: language.name,
      code: language.code,
      flag: language.flag,
      description: language.description || '',
      isActive: language.isActive,
    })
    setEditingId(language.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will delete all associated units and lessons!')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/languages/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      toast.success('Language deleted!')
      fetchLanguages()
    } catch (error) {
      toast.error('Failed to delete language')
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-xl">Loading...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Languages</h1>
            <p className="text-gray-600 mt-1">Manage learning languages</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin" className="btn-secondary">
              ← Back to Admin
            </Link>
            <button
              onClick={() => {
                setShowForm(true)
                setEditingId(null)
                setFormData({ name: '', code: '', flag: '', description: '', isActive: true })
              }}
              className="btn-primary"
            >
              + Add Language
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">
                {editingId ? 'Edit Language' : 'Add New Language'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Product Management"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code * (unique identifier)
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., pm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flag/Emoji *
                  </label>
                  <input
                    type="text"
                    value={formData.flag}
                    onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 📊"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Brief description of what learners will learn"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Active (visible to users)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingId ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingId(null)
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Languages List */}
        <div className="grid gap-4">
          {languages.map((language) => (
            <div
              key={language.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <span className="text-5xl">{language.flag}</span>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {language.name}
                      </h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-mono rounded">
                        {language.code}
                      </span>
                      {language.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    {language.description && (
                      <p className="text-gray-600 mt-2">{language.description}</p>
                    )}
                    <div className="mt-3 text-sm text-gray-500">
                      {language._count.units} unit{language._count.units !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(language)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(language.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {languages.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl">
              <div className="text-6xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No languages yet
              </h3>
              <p className="text-gray-600">
                Create your first language to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
