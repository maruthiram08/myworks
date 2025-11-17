import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const moderationSchema = z.object({
  isPublished: z.boolean().optional(),
  isSpam: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

// PATCH moderate product
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = moderationSchema.parse(body);

    const product = await prisma.product.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        maker: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            votes: true,
            comments: true,
            reports: true,
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error moderating product:", error);
    return NextResponse.json(
      { error: "Failed to moderate product" },
      { status: 500 }
    );
  }
}
