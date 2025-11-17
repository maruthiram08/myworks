import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { CoursePlayer } from "@/components/learn/course-player"

export const metadata: Metadata = {
  title: "Learn - CourseHub",
  description: "Course learning interface",
}

async function getCourseWithProgress(courseId: string, userId: string) {
  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  })

  if (!enrollment) {
    return null
  }

  // Get course with all data
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      sections: {
        include: {
          lectures: {
            where: { isPublished: true },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  })

  if (!course) {
    return null
  }

  // Get all lecture progress
  const allLectureIds = course.sections.flatMap((section) =>
    section.lectures.map((lecture) => lecture.id)
  )

  const progress = await prisma.lectureProgress.findMany({
    where: {
      userId,
      lectureId: { in: allLectureIds },
    },
  })

  return {
    course,
    enrollment,
    progress,
  }
}

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: { courseId: string }
  searchParams: { lectureId?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const data = await getCourseWithProgress(params.courseId, session.user.id)

  if (!data) {
    notFound()
  }

  const { course, enrollment, progress } = data

  // Check if user is instructor (bypass enrollment check)
  const isInstructor = course.instructorId === session.user.id

  if (!isInstructor && !enrollment) {
    redirect(`/courses/${course.slug}`)
  }

  return (
    <CoursePlayer
      course={course}
      enrollment={enrollment}
      progress={progress}
      initialLectureId={searchParams.lectureId}
      userId={session.user.id}
    />
  )
}
