"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Circle,
  PlayCircle,
  FileText,
  Award,
  ChevronRight,
  ChevronDown,
  Lock,
} from "lucide-react"
import { formatDuration } from "@/lib/utils"

interface CoursePlayerProps {
  course: any
  enrollment: any
  progress: any[]
  initialLectureId?: string
  userId: string
}

export function CoursePlayer({
  course,
  enrollment,
  progress,
  initialLectureId,
  userId,
}: CoursePlayerProps) {
  const router = useRouter()
  const [currentLecture, setCurrentLecture] = useState<any>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [isCompleting, setIsCompleting] = useState(false)

  // Get first lecture or initial lecture
  useEffect(() => {
    if (initialLectureId) {
      const lecture = course.sections
        .flatMap((s: any) => s.lectures)
        .find((l: any) => l.id === initialLectureId)
      if (lecture) {
        setCurrentLecture(lecture)
        return
      }
    }

    // Default to first lecture
    if (course.sections.length > 0 && course.sections[0].lectures.length > 0) {
      setCurrentLecture(course.sections[0].lectures[0])
      setExpandedSections(new Set([course.sections[0].id]))
    }
  }, [initialLectureId, course])

  const getLectureProgress = (lectureId: string) => {
    return progress.find((p) => p.lectureId === lectureId)
  }

  const isLectureCompleted = (lectureId: string) => {
    const p = getLectureProgress(lectureId)
    return p?.isCompleted || false
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleLectureClick = (lecture: any) => {
    setCurrentLecture(lecture)
    router.push(`/learn/${course.id}?lectureId=${lecture.id}`, { scroll: false })
  }

  const markAsComplete = async () => {
    if (!currentLecture || isCompleting) return

    setIsCompleting(true)

    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lectureId: currentLecture.id,
          isCompleted: true,
        }),
      })

      if (response.ok) {
        router.refresh()
        // Move to next lecture
        const allLectures = course.sections.flatMap((s: any) => s.lectures)
        const currentIndex = allLectures.findIndex((l: any) => l.id === currentLecture.id)
        if (currentIndex < allLectures.length - 1) {
          handleLectureClick(allLectures[currentIndex + 1])
        }
      }
    } catch (error) {
      console.error("Error marking as complete:", error)
    } finally {
      setIsCompleting(false)
    }
  }

  const completedLectures = progress.filter((p) => p.isCompleted).length
  const totalLectures = course.sections.reduce(
    (sum: number, section: any) => sum + section.lectures.length,
    0
  )
  const progressPercentage = totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Course Content */}
      <div className="w-80 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg mb-2">{course.title}</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Your Progress</span>
              <span className="font-medium">
                {completedLectures}/{totalLectures}
              </span>
            </div>
            <Progress value={progressPercentage} />
            <p className="text-sm text-gray-600">
              {Math.round(progressPercentage)}% complete
            </p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {course.sections.map((section: any) => (
            <div key={section.id} className="border rounded-lg">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-left">{section.title}</span>
                {expandedSections.has(section.id) ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedSections.has(section.id) && (
                <div className="divide-y">
                  {section.lectures.map((lecture: any) => {
                    const isCompleted = isLectureCompleted(lecture.id)
                    const isCurrent = currentLecture?.id === lecture.id

                    return (
                      <button
                        key={lecture.id}
                        onClick={() => handleLectureClick(lecture)}
                        className={`w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${
                          isCurrent ? "bg-blue-50" : ""
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {lecture.type === "VIDEO" && (
                              <PlayCircle className="w-4 h-4 text-gray-400" />
                            )}
                            {lecture.type === "PDF" && (
                              <FileText className="w-4 h-4 text-gray-400" />
                            )}
                            {lecture.type === "QUIZ" && (
                              <Award className="w-4 h-4 text-gray-400" />
                            )}
                            <span className={`text-sm truncate ${isCurrent ? "font-medium" : ""}`}>
                              {lecture.title}
                            </span>
                          </div>
                          {lecture.duration && (
                            <span className="text-xs text-gray-500">
                              {lecture.duration} min
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {currentLecture ? (
          <div className="max-w-5xl mx-auto p-8">
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>{currentLecture.type}</Badge>
                    {isLectureCompleted(currentLecture.id) && (
                      <Badge variant="success">Completed</Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold">{currentLecture.title}</h1>
                  {currentLecture.description && (
                    <p className="text-gray-600 mt-2">{currentLecture.description}</p>
                  )}
                </div>

                {/* Video Player */}
                {currentLecture.type === "VIDEO" && currentLecture.videoUrl && (
                  <div className="mb-6">
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                      <video
                        controls
                        className="w-full h-full"
                        src={currentLecture.videoUrl}
                        onEnded={() => {
                          if (!isLectureCompleted(currentLecture.id)) {
                            markAsComplete()
                          }
                        }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                )}

                {/* PDF Viewer */}
                {currentLecture.type === "PDF" && currentLecture.pdfUrl && (
                  <div className="mb-6">
                    <iframe
                      src={currentLecture.pdfUrl}
                      className="w-full h-[600px] border rounded-lg"
                      title={currentLecture.title}
                    />
                  </div>
                )}

                {/* Article Content */}
                {currentLecture.type === "ARTICLE" && currentLecture.content && (
                  <div className="mb-6 prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: currentLecture.content }} />
                  </div>
                )}

                {/* Quiz */}
                {currentLecture.type === "QUIZ" && (
                  <div className="mb-6 text-center py-12">
                    <Award className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-4">Quiz Time!</h3>
                    <p className="text-gray-600 mb-6">Test your knowledge with this quiz.</p>
                    <Button size="lg">Start Quiz</Button>
                  </div>
                )}

                {/* Mark as Complete Button */}
                {!isLectureCompleted(currentLecture.id) && (
                  <div className="flex justify-end">
                    <Button
                      onClick={markAsComplete}
                      disabled={isCompleting}
                      size="lg"
                    >
                      {isCompleting ? "Saving..." : "Mark as Complete"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-600">Select a lecture to begin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
