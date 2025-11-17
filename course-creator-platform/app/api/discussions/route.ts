import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const createPostSchema = z.object({
  discussionId: z.string(),
  content: z.string().min(1),
  parentId: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const courseId = searchParams.get("courseId")
    const discussionId = searchParams.get("discussionId")

    if (discussionId) {
      // Get posts for a specific discussion
      const posts = await prisma.discussionPost.findMany({
        where: { discussionId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  role: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        where: {
          parentId: null, // Only get top-level posts
        },
        orderBy: [
          { isPinned: "desc" },
          { createdAt: "desc" },
        ],
      })

      return NextResponse.json(posts)
    }

    if (courseId) {
      // Get all discussions for a course
      const discussions = await prisma.discussion.findMany({
        where: { courseId },
        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      return NextResponse.json(discussions)
    }

    return NextResponse.json(
      { error: "Either courseId or discussionId is required" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error fetching discussions:", error)
    return NextResponse.json(
      { error: "Failed to fetch discussions" },
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
    const validatedData = createPostSchema.parse(body)

    // Check if discussion exists and user has access
    const discussion = await prisma.discussion.findUnique({
      where: { id: validatedData.discussionId },
      include: {
        course: {
          include: {
            enrollments: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    })

    if (!discussion) {
      return NextResponse.json(
        { error: "Discussion not found" },
        { status: 404 }
      )
    }

    const isEnrolled = discussion.course.enrollments.length > 0
    const isInstructor = discussion.course.instructorId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isEnrolled && !isInstructor && !isAdmin) {
      return NextResponse.json(
        { error: "Must be enrolled to post" },
        { status: 403 }
      )
    }

    // Create post
    const post = await prisma.discussionPost.create({
      data: {
        content: validatedData.content,
        userId: session.user.id,
        discussionId: validatedData.discussionId,
        parentId: validatedData.parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error creating post:", error)
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    )
  }
}
