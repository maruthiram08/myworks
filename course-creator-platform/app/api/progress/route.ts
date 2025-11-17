import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const courseId = searchParams.get("courseId")
    const lectureId = searchParams.get("lectureId")

    if (lectureId) {
      // Get progress for specific lecture
      const progress = await prisma.lectureProgress.findUnique({
        where: {
          userId_lectureId: {
            userId: session.user.id,
            lectureId,
          },
        },
      })

      return NextResponse.json(progress)
    }

    if (courseId) {
      // Get progress for all lectures in a course
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          sections: {
            include: {
              lectures: true,
            },
          },
        },
      })

      if (!course) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 }
        )
      }

      const allLectureIds = course.sections.flatMap(section =>
        section.lectures.map(lecture => lecture.id)
      )

      const progress = await prisma.lectureProgress.findMany({
        where: {
          userId: session.user.id,
          lectureId: { in: allLectureIds },
        },
      })

      return NextResponse.json(progress)
    }

    return NextResponse.json(
      { error: "Either courseId or lectureId is required" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error fetching progress:", error)
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { lectureId, watchedDuration, isCompleted } = await request.json()

    if (!lectureId) {
      return NextResponse.json(
        { error: "Lecture ID is required" },
        { status: 400 }
      )
    }

    // Check if user is enrolled in the course
    const lecture = await prisma.lecture.findUnique({
      where: { id: lectureId },
      include: {
        section: {
          include: {
            course: {
              include: {
                enrollments: {
                  where: { userId: session.user.id },
                },
              },
            },
          },
        },
      },
    })

    if (!lecture) {
      return NextResponse.json(
        { error: "Lecture not found" },
        { status: 404 }
      )
    }

    const isEnrolled = lecture.section.course.enrollments.length > 0
    const isInstructor = lecture.section.course.instructorId === session.user.id

    if (!isEnrolled && !isInstructor) {
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 403 }
      )
    }

    // Update or create progress
    const progress = await prisma.lectureProgress.upsert({
      where: {
        userId_lectureId: {
          userId: session.user.id,
          lectureId,
        },
      },
      create: {
        userId: session.user.id,
        lectureId,
        watchedDuration: watchedDuration || 0,
        isCompleted: isCompleted || false,
        completedAt: isCompleted ? new Date() : null,
      },
      update: {
        watchedDuration: watchedDuration !== undefined ? watchedDuration : undefined,
        isCompleted: isCompleted !== undefined ? isCompleted : undefined,
        completedAt: isCompleted ? new Date() : undefined,
        lastWatchedAt: new Date(),
      },
    })

    // Update overall course progress
    if (isCompleted) {
      await updateCourseProgress(session.user.id, lecture.section.courseId)
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Error updating progress:", error)
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    )
  }
}

async function updateCourseProgress(userId: string, courseId: string) {
  // Get all lectures in the course
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      sections: {
        include: {
          lectures: true,
        },
      },
    },
  })

  if (!course) return

  const allLectures = course.sections.flatMap(section => section.lectures)
  const totalLectures = allLectures.length

  // Get completed lectures
  const completedProgress = await prisma.lectureProgress.findMany({
    where: {
      userId,
      lectureId: { in: allLectures.map(l => l.id) },
      isCompleted: true,
    },
  })

  const completedCount = completedProgress.length
  const progressPercentage = totalLectures > 0 ? (completedCount / totalLectures) * 100 : 0

  // Update enrollment
  await prisma.enrollment.update({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    data: {
      progress: progressPercentage,
      completedAt: progressPercentage === 100 ? new Date() : null,
      lastAccessedAt: new Date(),
    },
  })
}
