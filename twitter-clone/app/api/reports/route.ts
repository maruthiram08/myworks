import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || "PENDING"

    const reports = await prisma.report.findMany({
      where: {
        status: status as any,
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        reported: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json(
      { error: "Error fetching reports" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type, reason, reportedId, postId } = await req.json()

    if (!type || !reason) {
      return NextResponse.json(
        { error: "Type and reason required" },
        { status: 400 }
      )
    }

    if (type === "USER" && !reportedId) {
      return NextResponse.json(
        { error: "Reported user ID required" },
        { status: 400 }
      )
    }

    if (type === "POST" && !postId) {
      return NextResponse.json(
        { error: "Post ID required" },
        { status: 400 }
      )
    }

    const report = await prisma.report.create({
      data: {
        type,
        reason,
        reporterId: session.user.id,
        reportedId,
        postId,
      },
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error("Error creating report:", error)
    return NextResponse.json(
      { error: "Error creating report" },
      { status: 500 }
    )
  }
}
