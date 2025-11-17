import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all products for admin (including unpublished and spam)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // all, published, unpublished, spam
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    let where: any = {};

    if (status === "published") {
      where.isPublished = true;
      where.isSpam = false;
    } else if (status === "unpublished") {
      where.isPublished = false;
    } else if (status === "spam") {
      where.isSpam = true;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          maker: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          category: true,
          tags: true,
          _count: {
            select: {
              votes: true,
              comments: true,
              reports: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
