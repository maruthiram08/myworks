import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { slugify } from "@/lib/utils"
import { z } from "zod"

const createCourseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  shortDescription: z.string().optional(),
  categoryId: z.string(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]),
  pricingType: z.enum(["FREE", "ONE_TIME", "SUBSCRIPTION"]),
  price: z.number().min(0),
  subscriptionPrice: z.number().optional(),
  language: z.string().default("en"),
  requirements: z.array(z.string()).optional(),
  learningOutcomes: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const categoryId = searchParams.get("categoryId")
    const instructorId = searchParams.get("instructorId")

    const where: any = {}
    if (status) where.status = status
    if (categoryId) where.categoryId = categoryId
    if (instructorId) where.instructorId = instructorId

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
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createCourseSchema.parse(body)

    // Generate unique slug
    let slug = slugify(validatedData.title)
    let counter = 1
    while (await prisma.course.findUnique({ where: { slug } })) {
      slug = `${slugify(validatedData.title)}-${counter}`
      counter++
    }

    const course = await prisma.course.create({
      data: {
        title: validatedData.title,
        slug,
        description: validatedData.description,
        shortDescription: validatedData.shortDescription,
        level: validatedData.level,
        pricingType: validatedData.pricingType,
        price: validatedData.price,
        subscriptionPrice: validatedData.subscriptionPrice,
        language: validatedData.language,
        categoryId: validatedData.categoryId,
        instructorId: session.user.id,
        requirements: validatedData.requirements
          ? {
              create: validatedData.requirements.map((req, index) => ({
                content: req,
                order: index,
              })),
            }
          : undefined,
        learningOutcomes: validatedData.learningOutcomes
          ? {
              create: validatedData.learningOutcomes.map((outcome, index) => ({
                content: outcome,
                order: index,
              })),
            }
          : undefined,
      },
      include: {
        instructor: true,
        category: true,
      },
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error creating course:", error)
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    )
  }
}
