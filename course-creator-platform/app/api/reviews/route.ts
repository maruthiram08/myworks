import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const createReviewSchema = z.object({
  courseId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const courseId = searchParams.get("courseId")

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      )
    }

    const reviews = await prisma.review.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
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

    const body = await request.json()
    const validatedData = createReviewSchema.parse(body)

    // Check if user is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: validatedData.courseId,
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: "Must be enrolled to leave a review" },
        { status: 403 }
      )
    }

    // Check if user already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: validatedData.courseId,
        },
      },
    })

    if (existingReview) {
      // Update existing review
      const updatedReview = await prisma.review.update({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: validatedData.courseId,
          },
        },
        data: {
          rating: validatedData.rating,
          comment: validatedData.comment,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      })

      // Update course average rating
      await updateCourseRating(validatedData.courseId)

      return NextResponse.json(updatedReview)
    }

    // Create new review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        courseId: validatedData.courseId,
        rating: validatedData.rating,
        comment: validatedData.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Update course average rating
    await updateCourseRating(validatedData.courseId)

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error creating review:", error)
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    )
  }
}

async function updateCourseRating(courseId: string) {
  const reviews = await prisma.review.findMany({
    where: { courseId },
    select: { rating: true },
  })

  if (reviews.length === 0) return

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

  await prisma.course.update({
    where: { id: courseId },
    data: {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    },
  })
}
