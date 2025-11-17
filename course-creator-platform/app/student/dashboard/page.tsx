import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Award, TrendingUp } from "lucide-react"
import { formatDuration } from "@/lib/utils"

export const metadata: Metadata = {
  title: "My Learning - Course Creator Platform",
  description: "Track your learning progress and continue your courses.",
}

async function getStudentData(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          category: true,
          sections: {
            include: {
              lectures: true,
            },
          },
        },
      },
    },
    orderBy: { lastAccessedAt: "desc" },
  })

  return enrollments
}

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const enrollments = await getStudentData(session.user.id)

  const totalCourses = enrollments.length
  const completedCourses = enrollments.filter((e) => e.completedAt).length
  const inProgressCourses = enrollments.filter(
    (e) => !e.completedAt && e.progress > 0
  ).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Learning</h1>
          <p className="text-gray-600 mt-2">
            Track your progress and continue learning
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                In Progress
              </CardTitle>
              <Clock className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed
              </CardTitle>
              <Award className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Progress
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalCourses > 0
                  ? Math.round(
                      enrollments.reduce((sum, e) => sum + e.progress, 0) /
                        totalCourses
                    )
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Courses */}
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <CardDescription>
              Continue learning where you left off
            </CardDescription>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No courses enrolled
                </h3>
                <p className="text-gray-600 mb-4">
                  Browse our course catalog to start learning
                </p>
                <Link href="/courses">
                  <Button>Browse Courses</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enrollment) => {
                  const course = enrollment.course
                  const totalLectures = course.sections.reduce(
                    (sum, section) => sum + section.lectures.length,
                    0
                  )

                  return (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {course.thumbnail && (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-32 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            by {course.instructor.name}
                          </p>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">
                                {Math.round(enrollment.progress)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{
                                  width: `${enrollment.progress}%`,
                                }}
                              />
                            </div>
                          </div>
                          {enrollment.completedAt && (
                            <div className="mt-2 inline-flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                              <Award className="w-4 h-4" />
                              Completed
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/learn/${course.id}`}>
                          <Button>
                            {enrollment.progress === 0
                              ? "Start Learning"
                              : enrollment.completedAt
                              ? "Review"
                              : "Continue"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
