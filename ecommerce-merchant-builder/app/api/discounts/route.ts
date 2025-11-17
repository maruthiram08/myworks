import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const discountSchema = z.object({
  code: z.string().min(1).toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  value: z.number().positive(),
  minPurchase: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
});

// GET /api/discounts - List discounts
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'MERCHANT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const store = await prisma.store.findUnique({
      where: { userId: session.user.id },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 400 }
      );
    }

    const discounts = await prisma.discount.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(discounts);
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discounts' },
      { status: 500 }
    );
  }
}

// POST /api/discounts - Create discount
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'MERCHANT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const store = await prisma.store.findUnique({
      where: { userId: session.user.id },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validatedData = discountSchema.parse(body);

    // Check if code already exists for this store
    const existingDiscount = await prisma.discount.findUnique({
      where: {
        storeId_code: {
          storeId: store.id,
          code: validatedData.code,
        },
      },
    });

    if (existingDiscount) {
      return NextResponse.json(
        { error: 'Discount code already exists' },
        { status: 400 }
      );
    }

    const discount = await prisma.discount.create({
      data: {
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        storeId: store.id,
      },
    });

    return NextResponse.json(discount, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating discount:', error);
    return NextResponse.json(
      { error: 'Failed to create discount' },
      { status: 500 }
    );
  }
}
