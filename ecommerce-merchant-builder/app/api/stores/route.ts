import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const storeSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  logo: z.string().optional(),
  domain: z.string().optional(),
  primaryColor: z.string().default('#000000'),
  secondaryColor: z.string().default('#ffffff'),
  customCSS: z.string().optional(),
});

// GET /api/stores - Get store (Merchant's own or by domain)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');

    if (domain) {
      const store = await prisma.store.findUnique({
        where: { domain },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              products: true,
              orders: true,
            },
          },
        },
      });

      if (!store || !store.isActive) {
        return NextResponse.json(
          { error: 'Store not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(store);
    }

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'MERCHANT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const store = await prisma.store.findUnique({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: {
            products: true,
            categories: true,
            orders: true,
          },
        },
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.error('Error fetching store:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store' },
      { status: 500 }
    );
  }
}

// POST /api/stores - Create store (Merchant only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'MERCHANT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if merchant already has a store
    const existingStore = await prisma.store.findUnique({
      where: { userId: session.user.id },
    });

    if (existingStore) {
      return NextResponse.json(
        { error: 'You already have a store' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validatedData = storeSchema.parse(body);

    // Check if domain is already taken
    if (validatedData.domain) {
      const domainExists = await prisma.store.findUnique({
        where: { domain: validatedData.domain },
      });

      if (domainExists) {
        return NextResponse.json(
          { error: 'Domain already taken' },
          { status: 400 }
        );
      }
    }

    const store = await prisma.store.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating store:', error);
    return NextResponse.json(
      { error: 'Failed to create store' },
      { status: 500 }
    );
  }
}

// PATCH /api/stores - Update store
export async function PATCH(req: Request) {
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
        { status: 404 }
      );
    }

    const body = await req.json();
    const validatedData = storeSchema.partial().parse(body);

    // Check if domain is already taken (if being updated)
    if (validatedData.domain && validatedData.domain !== store.domain) {
      const domainExists = await prisma.store.findUnique({
        where: { domain: validatedData.domain },
      });

      if (domainExists) {
        return NextResponse.json(
          { error: 'Domain already taken' },
          { status: 400 }
        );
      }
    }

    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: validatedData,
    });

    return NextResponse.json(updatedStore);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating store:', error);
    return NextResponse.json(
      { error: 'Failed to update store' },
      { status: 500 }
    );
  }
}
