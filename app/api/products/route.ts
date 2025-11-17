import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { slugify, calculateTrendingScore } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  tagline: z.string().min(10, "Tagline must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  website: z.string().url().optional().or(z.literal("")),
  logo: z.string().optional(),
  images: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET all products with filtering and search
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const tag = searchParams.get("tag");
    const sort = searchParams.get("sort") || "trending";
    const date = searchParams.get("date");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {
      isPublished: true,
      isSpam: false,
    };

    if (category) {
      where.category = { slug: category };
    }

    if (tag) {
      where.tags = {
        some: {
          slug: tag,
        },
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { tagline: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      where.createdAt = {
        gte: targetDate,
        lt: nextDay,
      };
    }

    const products = await prisma.product.findMany({
      where,
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
      skip,
      take: limit,
      orderBy:
        sort === "newest"
          ? { createdAt: "desc" }
          : sort === "votes"
          ? { votes: { _count: "desc" } }
          : { createdAt: "desc" },
    });

    // Calculate trending scores if sorting by trending
    let sortedProducts = products;
    if (sort === "trending") {
      sortedProducts = products
        .map((product) => ({
          ...product,
          trendingScore: calculateTrendingScore(
            product._count.votes,
            product._count.comments,
            product.createdAt
          ),
        }))
        .sort((a, b) => b.trendingScore - a.trendingScore);
    }

    const total = await prisma.product.count({ where });

    return NextResponse.json({
      products: sortedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "MAKER" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only makers can post products" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = productSchema.parse(body);

    // Create or connect tags
    const tagConnections = await Promise.all(
      (validatedData.tags || []).map(async (tagName) => {
        const slug = slugify(tagName);
        const tag = await prisma.tag.upsert({
          where: { slug },
          create: { name: tagName, slug },
          update: {},
        });
        return { id: tag.id };
      })
    );

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        tagline: validatedData.tagline,
        description: validatedData.description,
        website: validatedData.website || null,
        logo: validatedData.logo,
        images: validatedData.images || [],
        makerId: session.user.id,
        categoryId: validatedData.categoryId || null,
        tags: {
          connect: tagConnections,
        },
      },
      include: {
        maker: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: true,
        tags: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
