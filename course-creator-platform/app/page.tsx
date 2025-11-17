import { Metadata } from "next"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPrice, formatDuration } from "@/lib/utils"
import { BookOpen, Users, Star } from "lucide-react"

export const metadata: Metadata = {
  title: "Course Creator Platform - Learn from Expert Instructors",
  description: "Discover and enroll in online courses taught by industry experts. Master new skills with video lectures, quizzes, and interactive content.",
  keywords: "online courses, learning platform, video tutorials, skills training, education",
  openGraph: {
    title: "Course Creator Platform - Learn from Expert Instructors",
    description: "Discover and enroll in online courses taught by industry experts.",
    type: "website",
  },
}

async function getFeaturedCourses() {
  const courses = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
    },
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
    take: 8,
  })

  return courses
}

async function getCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          courses: true,
        },
      },
    },
    take: 6,
  })

  return categories
}

export default async function Home() {
  const [courses, categories] = await Promise.all([
    getFeaturedCourses(),
    getCategories(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Learn Without Limits
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Master new skills with courses from expert instructors. Join thousands of students learning online.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/courses">
                <Button size="lg" variant="secondary">
                  Browse Courses
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                  Start Teaching
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {courses.length}+
              </div>
              <div className="text-gray-600">Courses Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {courses.reduce((acc, course) => acc + course._count.enrollments, 0)}+
              </div>
              <div className="text-gray-600">Students Enrolled</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {categories.length}+
              </div>
              <div className="text-gray-600">Categories</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/courses?category=${category.slug}`}
                className="p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-center"
              >
                <div className="font-semibold mb-1">{category.name}</div>
                <div className="text-sm text-gray-500">
                  {category._count.courses} courses
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">
                          {course.averageRating.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{course._count.enrollments}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <div className="font-bold text-lg text-blue-600">
                        {course.pricingType === "FREE"
                          ? "Free"
                          : formatPrice(course.price)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Teaching?</h2>
          <p className="text-lg mb-8 text-indigo-100">
            Share your knowledge with students worldwide. Create engaging courses and earn money.
          </p>
          <Link href="/instructor/dashboard">
            <Button size="lg" variant="secondary">
              Become an Instructor
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
