import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, DollarSign, FolderTree } from "lucide-react"

export const metadata: Metadata = {
  title: "Admin Dashboard - CourseHub",
  description: "Platform administration and analytics",
}

async function getAdminStats() {
  const [totalUsers, totalCourses, totalRevenue, totalCategories] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.category.count(),
  ])

  const instructorCount = await prisma.user.count({
    where: { role: "INSTRUCTOR" },
  })

  const studentCount = await prisma.user.count({
    where: { role: "STUDENT" },
  })

  return {
    totalUsers,
    instructorCount,
    studentCount,
    totalCourses,
    totalRevenue: totalRevenue._sum.amount || 0,
    totalCategories,
  }
}

async function getRecentCourses() {
  return await prisma.course.findMany({
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      category: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  })
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const [stats, recentCourses] = await Promise.all([
    getAdminStats(),
    getRecentCourses(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-gray-600 mt-1">
                {stats.instructorCount} instructors, {stats.studentCount} students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <FolderTree className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCategories}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-gray-600">
                      by {course.instructor.name} • {course.category.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-medium ${
                        course.status === "PUBLISHED"
                          ? "text-green-600"
                          : course.status === "DRAFT"
                          ? "text-yellow-600"
                          : "text-gray-600"
                      }`}
                    >
                      {course.status}
                    </div>
                    <div className="text-xs text-gray-500">
                      {course.enrollmentCount} enrollments
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
