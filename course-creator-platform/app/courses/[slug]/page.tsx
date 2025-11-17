import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatPrice, formatDuration } from "@/lib/utils"
import { Star, Users, Clock, CheckCircle, PlayCircle, FileText, Award } from "lucide-react"
import Link from "next/link"
import { EnrollButton } from "@/components/courses/enroll-button"

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      metaTitle: true,
      description: true,
      metaDescription: true,
      metaKeywords: true,
      thumbnail: true,
    },
  })

  if (!course) {
    return {
      title: "Course Not Found",
    }
  }

  return {
    title: course.metaTitle || `${course.title} - CourseHub`,
    description: course.metaDescription || course.description.substring(0, 160),
    keywords: course.metaKeywords || undefined,
    openGraph: {
      title: course.metaTitle || course.title,
      description: course.metaDescription || course.description.substring(0, 160),
      images: course.thumbnail ? [course.thumbnail] : [],
    },
  }
}

async function getCourse(slug: string, userId?: string) {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
        },
      },
      category: true,
      sections: {
        include: {
          lectures: {
            where: {
              isPublished: true,
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
      requirements: {
        orderBy: { order: "asc" },
      },
      learningOutcomes: {
        orderBy: { order: "asc" },
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      enrollments: userId ? {
        where: { userId },
      } : undefined,
      _count: {
        select: {
          enrollments: true,
          reviews: true,
        },
      },
    },
  })

  return course
}

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const session = await getServerSession(authOptions)
  const course = await getCourse(params.slug, session?.user.id)

  if (!course) {
    notFound()
  }

  const isEnrolled = course.enrollments && course.enrollments.length > 0
  const isInstructor = session?.user.id === course.instructorId
  const totalLectures = course.sections.reduce(
    (sum, section) => sum + section.lectures.length,
    0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Badge>{course.category.name}</Badge>
                <Badge variant="outline" className="bg-transparent border-white text-white">
                  {course.level.replace("_", " ")}
                </Badge>
              </div>

              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-gray-300 mb-6">{course.shortDescription}</p>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">
                    {course.averageRating > 0 ? course.averageRating.toFixed(1) : "New"}
                  </span>
                  {course._count.reviews > 0 && (
                    <span className="text-gray-400">
                      ({course._count.reviews} {course._count.reviews === 1 ? "review" : "reviews"})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{course._count.enrollments} students</span>
                </div>

                {course.totalDuration > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{formatDuration(course.totalDuration)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={course.instructor.image || "/default-avatar.png"}
                  alt={course.instructor.name || "Instructor"}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="text-sm text-gray-400">Created by</div>
                  <div className="font-semibold">{course.instructor.name}</div>
                </div>
              </div>
            </div>

            {/* Course Card */}
            <div className="lg:col-span-1">
              <Card>
                {course.thumbnail && (
                  <div className="aspect-video bg-gray-200 overflow-hidden rounded-t-lg">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="text-3xl font-bold mb-4">
                    {course.pricingType === "FREE" ? (
                      <span className="text-green-600">Free</span>
                    ) : course.pricingType === "SUBSCRIPTION" ? (
                      <>
                        <span>{formatPrice(course.subscriptionPrice || 0)}</span>
                        <span className="text-base font-normal text-gray-600">/month</span>
                      </>
                    ) : (
                      <span>{formatPrice(course.price)}</span>
                    )}
                  </div>

                  {isEnrolled ? (
                    <div className="space-y-3">
                      <Link href={`/learn/${course.id}`}>
                        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                          Continue Learning
                        </button>
                      </Link>
                      {course.enrollments && course.enrollments[0].progress > 0 && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Your Progress</span>
                            <span>{Math.round(course.enrollments[0].progress)}%</span>
                          </div>
                          <Progress value={course.enrollments[0].progress} />
                        </div>
                      )}
                    </div>
                  ) : isInstructor ? (
                    <Link href={`/instructor/courses/${course.id}`}>
                      <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                        Edit Course
                      </button>
                    </Link>
                  ) : (
                    <EnrollButton courseId={course.id} pricingType={course.pricingType} />
                  )}

                  <div className="mt-6 pt-6 border-t space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lectures</span>
                      <span className="font-medium">{totalLectures}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{formatDuration(course.totalDuration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level</span>
                      <span className="font-medium">{course.level.replace("_", " ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language</span>
                      <span className="font-medium">{course.language.toUpperCase()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* What you'll learn */}
            {course.learningOutcomes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>What you'll learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.learningOutcomes.map((outcome) => (
                      <div key={outcome.id} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{outcome.content}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Content */}
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                  {course.sections.length} sections • {totalLectures} lectures
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.sections.map((section) => (
                  <div key={section.id} className="border rounded-lg">
                    <div className="p-4 bg-gray-50 font-semibold">
                      {section.title}
                    </div>
                    <div className="divide-y">
                      {section.lectures.map((lecture) => (
                        <div key={lecture.id} className="p-4 flex items-center gap-3">
                          {lecture.type === "VIDEO" && <PlayCircle className="w-5 h-5 text-gray-400" />}
                          {lecture.type === "PDF" && <FileText className="w-5 h-5 text-gray-400" />}
                          {lecture.type === "QUIZ" && <Award className="w-5 h-5 text-gray-400" />}
                          <span className="flex-1">{lecture.title}</span>
                          {lecture.isFree && (
                            <Badge variant="success">Preview</Badge>
                          )}
                          {lecture.duration && (
                            <span className="text-sm text-gray-600">
                              {lecture.duration} min
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {course.description}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {course.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.requirements.map((req) => (
                      <li key={req.id} className="flex items-start gap-2">
                        <span className="text-gray-400 mt-1">•</span>
                        <span>{req.content}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {course.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Student Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {course.reviews.map((review) => (
                    <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={review.user.image || "/default-avatar.png"}
                          alt={review.user.name || "User"}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-semibold">{review.user.name}</div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.comment && <p className="text-gray-700">{review.comment}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Instructor */}
            <Card>
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={course.instructor.image || "/default-avatar.png"}
                    alt={course.instructor.name || "Instructor"}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-lg">{course.instructor.name}</div>
                  </div>
                </div>
                {course.instructor.bio && (
                  <p className="text-sm text-gray-600">{course.instructor.bio}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
