import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "10")

    const hashtags = await prisma.hashtag.findMany({
      orderBy: {
        count: "desc",
      },
      take: limit,
    })

    return NextResponse.json(hashtags)
  } catch (error) {
    console.error("Error fetching trending hashtags:", error)
    return NextResponse.json(
      { error: "Error fetching trending hashtags" },
      { status: 500 }
    )
  }
}
