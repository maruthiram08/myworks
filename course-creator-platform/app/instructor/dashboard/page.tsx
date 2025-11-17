import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, DollarSign, Plus, BarChart } from "lucide-react"

export const metadata: Metadata = {
  title: "Instructor Dashboard - Course Creator Platform",
  description: "Manage your courses, track student enrollment, and monitor your earnings.",
}

async function getInstructorData(userId: string) {
  const [courses, totalStudents, totalRevenue] = await Promise.all([
    prisma.course.findMany({
      where: { instructorId: userId },
      include: {
        category: true,
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.enrollment.count({
      where: {
        course: {
          instructorId: userId,
        },
      },
    }),
    prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
        course: {
          instructorId: userId,
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ])

  return {
    courses,
    totalStudents,
    totalRevenue: totalRevenue._sum.amount || 0,
  }
}

export default async function InstructorDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
    redirect("/auth/signin")
  }

  const { courses, totalStudents, totalRevenue } = await getInstructorData(
    session.user.id
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage your courses and track your performance
            </p>
          </div>
          <Link href="/instructor/courses/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </Link>
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
              <div className="text-2xl font-bold">{courses.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Rating
              </CardTitle>
              <BarChart className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courses.length > 0
                  ? (
                      courses.reduce((sum, c) => sum + c.averageRating, 0) /
                      courses.length
                    ).toFixed(1)
                  : "0.0"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Courses</CardTitle>
            <CardDescription>
              Manage and edit your course content
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first course to start teaching
                </p>
                <Link href="/instructor/courses/new">
                  <Button>Create Your First Course</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {course.thumbnail && (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {course._count.enrollments} students
                          </span>
                          <span>
                            Status:{" "}
                            <span
                              className={`font-medium ${
                                course.status === "PUBLISHED"
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              {course.status}
                            </span>
                          </span>
                          <span>
                            {course.pricingType === "FREE"
                              ? "Free"
                              : `$${course.price}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/instructor/courses/${course.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/courses/${course.slug}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
