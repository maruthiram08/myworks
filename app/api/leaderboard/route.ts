import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    // Default to today
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    // Get products created on the target date
    const products = await prisma.product.findMany({
      where: {
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
        isPublished: true,
        isSpam: false,
      },
      include: {
        maker: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        category: true,
        tags: true,
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        votes: {
          _count: "desc",
        },
      },
      take: 10,
    });

    return NextResponse.json({
      date: targetDate.toISOString(),
      products,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
