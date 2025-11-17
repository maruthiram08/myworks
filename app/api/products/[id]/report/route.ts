import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reportSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  details: z.string().optional(),
});

// POST create report
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = reportSchema.parse(body);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if user already reported this product
    const existingReport = await prisma.report.findFirst({
      where: {
        userId: session.user.id,
        productId: params.id,
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this product" },
        { status: 400 }
      );
    }

    const report = await prisma.report.create({
      data: {
        reason: validatedData.reason,
        details: validatedData.details,
        userId: session.user.id,
        productId: params.id,
      },
    });

    // Auto-flag as spam if multiple reports (spam prevention)
    const reportCount = await prisma.report.count({
      where: {
        productId: params.id,
        resolved: false,
      },
    });

    if (reportCount >= 3) {
      await prisma.product.update({
        where: { id: params.id },
        data: { isSpam: true, isPublished: false },
      });
    }

    return NextResponse.json(
      { message: "Report submitted successfully", report },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
