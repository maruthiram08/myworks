import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const createLectureSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["VIDEO", "PDF", "ARTICLE", "QUIZ"]),
  order: z.number().int().default(0),
  duration: z.number().optional(),
  videoUrl: z.string().optional(),
  videoProvider: z.string().optional(),
  videoId: z.string().optional(),
  pdfUrl: z.string().optional(),
  content: z.string().optional(),
  isFree: z.boolean().default(false),
  isPublished: z.boolean().default(false),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string; sectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify ownership
    const section = await prisma.section.findUnique({
      where: { id: params.sectionId },
      include: {
        course: true,
      },
    })

    if (!section || section.courseId !== params.courseId) {
      return NextResponse.json(
        { error: "Section not found" },
        { status: 404 }
      )
    }

    const isOwner = section.course.instructorId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createLectureSchema.parse(body)

    const lecture = await prisma.lecture.create({
      data: {
        ...validatedData,
        sectionId: params.sectionId,
      },
    })

    // Update course total lectures
    const totalLectures = await prisma.lecture.count({
      where: {
        section: {
          courseId: params.courseId,
        },
      },
    })

    await prisma.course.update({
      where: { id: params.courseId },
      data: { totalLectures },
    })

    return NextResponse.json(lecture, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error creating lecture:", error)
    return NextResponse.json(
      { error: "Failed to create lecture" },
      { status: 500 }
    )
  }
}
