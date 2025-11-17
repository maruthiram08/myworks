import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const updateCourseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  shortDescription: z.string().optional(),
  thumbnail: z.string().optional(),
  previewVideo: z.string().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  pricingType: z.enum(["FREE", "ONE_TIME", "SUBSCRIPTION"]).optional(),
  price: z.number().min(0).optional(),
  subscriptionPrice: z.number().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { courseId } = params

    const course = await prisma.course.findUnique({
      where: { id: courseId },
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
          take: 10,
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
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

    // If course is not published, only allow instructor, admin, or enrolled students
    if (course.status !== "PUBLISHED") {
      if (!session) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      const isInstructor = course.instructorId === session.user.id
      const isAdmin = session.user.role === "ADMIN"

      if (!isInstructor && !isAdmin) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { courseId } = params
    const body = await request.json()
    const validatedData = updateCourseSchema.parse(body)

    // Check if user owns this course or is admin
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    const isOwner = existingCourse.instructorId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...validatedData,
        publishedAt: validatedData.status === "PUBLISHED" && !existingCourse.publishedAt
          ? new Date()
          : existingCourse.publishedAt,
      },
      include: {
        instructor: true,
        category: true,
      },
    })

    return NextResponse.json(course)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error updating course:", error)
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { courseId } = params

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    const isOwner = course.instructorId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await prisma.course.delete({
      where: { id: courseId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting course:", error)
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    )
  }
}
