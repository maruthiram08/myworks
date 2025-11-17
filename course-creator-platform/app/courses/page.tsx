import { Metadata } from "next"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { Star, Users, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Browse Courses - CourseHub",
  description: "Explore thousands of online courses in various categories. Find the perfect course to learn new skills.",
}

async function getCourses(searchParams: { category?: string; level?: string; search?: string }) {
  const where: any = {
    status: "PUBLISHED",
  }

  if (searchParams.category) {
    where.category = {
      slug: searchParams.category,
    }
  }

  if (searchParams.level) {
    where.level = searchParams.level
  }

  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search, mode: "insensitive" } },
      { description: { contains: searchParams.search, mode: "insensitive" } },
    ]
  }

  const courses = await prisma.course.findMany({
    where,
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      category: true,
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
    orderBy: {
      enrollmentCount: "desc",
    },
  })

  return courses
}

async function getCategories() {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: {
          courses: {
            where: { status: "PUBLISHED" },
          },
        },
      },
    },
  })
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { category?: string; level?: string; search?: string }
}) {
  const [courses, categories] = await Promise.all([
    getCourses(searchParams),
    getCategories(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-2">Explore Courses</h1>
          <p className="text-gray-600">
            Discover courses from expert instructors across all categories
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="font-semibold mb-3">Categories</h3>
                  <div className="space-y-2">
                    <Link
                      href="/courses"
                      className={`block text-sm hover:text-blue-600 ${
                        !searchParams.category ? "text-blue-600 font-medium" : "text-gray-700"
                      }`}
                    >
                      All Categories
                    </Link>
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/courses?category=${category.slug}`}
                        className={`block text-sm hover:text-blue-600 ${
                          searchParams.category === category.slug
                            ? "text-blue-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {category.name} ({category._count.courses})
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Level */}
                <div>
                  <h3 className="font-semibold mb-3">Level</h3>
                  <div className="space-y-2">
                    {["ALL_LEVELS", "BEGINNER", "INTERMEDIATE", "ADVANCED"].map((level) => (
                      <Link
                        key={level}
                        href={`/courses?${searchParams.category ? `category=${searchParams.category}&` : ""}level=${level}`}
                        className={`block text-sm hover:text-blue-600 ${
                          searchParams.level === level
                            ? "text-blue-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {level.replace("_", " ")}
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <p className="text-gray-600">
                {courses.length} {courses.length === 1 ? "course" : "courses"} found
              </p>
            </div>

            {courses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">No courses found matching your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Link key={course.id} href={`/courses/${course.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      {course.thumbnail && (
                        <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{course.category.name}</Badge>
                          <Badge variant="outline">
                            {course.level.replace("_", " ")}
                          </Badge>
                        </div>
                        <CardTitle className="line-clamp-2 text-lg">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {course.shortDescription || course.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <img
                            src={course.instructor.image || "/default-avatar.png"}
                            alt={course.instructor.name || "Instructor"}
                            className="w-6 h-6 rounded-full"
                          />
                          <span>{course.instructor.name}</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">
                              {course.averageRating > 0
                                ? course.averageRating.toFixed(1)
                                : "New"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{course._count.enrollments}</span>
                          </div>
                          {course.totalDuration > 0 && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{Math.round(course.totalDuration / 60)}h</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t">
                          <div className="font-bold text-lg text-blue-600">
                            {course.pricingType === "FREE"
                              ? "Free"
                              : course.pricingType === "SUBSCRIPTION"
                              ? `${formatPrice(course.subscriptionPrice || 0)}/mo`
                              : formatPrice(course.price)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
