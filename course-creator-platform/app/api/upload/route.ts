import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { writeFile } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

// This is a basic implementation using local file storage
// In production, you should use AWS S3, Cloudflare R2, or similar services

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // 'video' or 'pdf'

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"]
    const allowedPdfTypes = ["application/pdf"]

    if (type === "video" && !allowedVideoTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid video format. Allowed: MP4, WebM, MOV" },
        { status: 400 }
      )
    }

    if (type === "pdf" && !allowedPdfTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file format. Only PDF allowed" },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop()
    const uniqueFileName = `${randomUUID()}.${fileExtension}`
    const uploadDir = type === "video" ? "uploads/videos" : "uploads/pdfs"

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save file (in production, upload to S3/Cloudflare Stream instead)
    const filePath = join(process.cwd(), "public", uploadDir, uniqueFileName)
    await writeFile(filePath, buffer)

    const publicUrl = `/${uploadDir}/${uniqueFileName}`

    // For videos, you would also:
    // 1. Upload to video processing service (Cloudflare Stream, AWS MediaConvert)
    // 2. Generate HLS/DASH streams
    // 3. Create thumbnail
    // 4. Return video ID for secure playback

    return NextResponse.json({
      url: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}

// Generate signed URL for secure video access
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    const videoId = searchParams.get("videoId")
    const lectureId = searchParams.get("lectureId")

    if (!session || !videoId || !lectureId) {
      return NextResponse.json(
        { error: "Unauthorized or missing parameters" },
        { status: 401 }
      )
    }

    // Check if user has access to this lecture
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
    const isAdmin = session.user.role === "ADMIN"
    const isFreePreview = lecture.isFree

    if (!isEnrolled && !isInstructor && !isAdmin && !isFreePreview) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // In production, generate signed URL from your video service
    // For now, return the direct URL
    const signedUrl = `/uploads/videos/${videoId}`

    return NextResponse.json({
      url: signedUrl,
      expiresIn: 3600, // 1 hour
    })
  } catch (error) {
    console.error("Error generating signed URL:", error)
    return NextResponse.json(
      { error: "Failed to generate video URL" },
      { status: 500 }
    )
  }
}
