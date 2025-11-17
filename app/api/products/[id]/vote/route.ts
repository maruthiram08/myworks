import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST toggle vote (upvote or remove vote)
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const productId = params.id;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId,
        },
      },
    });

    if (existingVote) {
      // Remove vote
      await prisma.vote.delete({
        where: {
          id: existingVote.id,
        },
      });

      const voteCount = await prisma.vote.count({
        where: { productId },
      });

      return NextResponse.json({
        voted: false,
        voteCount,
        message: "Vote removed",
      });
    } else {
      // Add vote
      await prisma.vote.create({
        data: {
          userId: session.user.id,
          productId: productId,
        },
      });

      const voteCount = await prisma.vote.count({
        where: { productId },
      });

      return NextResponse.json({
        voted: true,
        voteCount,
        message: "Vote added",
      });
    }
  } catch (error) {
    console.error("Error toggling vote:", error);
    return NextResponse.json(
      { error: "Failed to process vote" },
      { status: 500 }
    );
  }
}

// GET check if user voted
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ voted: false, voteCount: 0 });
    }

    const [vote, voteCount] = await Promise.all([
      prisma.vote.findUnique({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId: params.id,
          },
        },
      }),
      prisma.vote.count({
        where: { productId: params.id },
      }),
    ]);

    return NextResponse.json({
      voted: !!vote,
      voteCount,
    });
  } catch (error) {
    console.error("Error checking vote:", error);
    return NextResponse.json(
      { error: "Failed to check vote" },
      { status: 500 }
    );
  }
}
