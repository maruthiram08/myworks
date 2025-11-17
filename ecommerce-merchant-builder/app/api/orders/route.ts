import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateOrderNumber } from '@/lib/utils';

// GET /api/orders - List orders
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    let where: any = {};

    if (session.user.role === 'MERCHANT') {
      // Merchant sees their store's orders
      const store = await prisma.store.findUnique({
        where: { userId: session.user.id },
      });

      if (!store) {
        return NextResponse.json({ orders: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      }

      where.storeId = store.id;
    } else if (session.user.role === 'BUYER') {
      // Buyer sees their own orders
      where.userId = session.user.id;
    } else if (session.user.role === 'ADMIN') {
      // Admin sees all orders (no filter)
    }

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create order
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const {
      storeId,
      items,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      billingAddress,
      discountCode,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must have at least one item' },
        { status: 400 }
      );
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }

      const itemTotal = Number(product.price) * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        total: itemTotal,
      });
    }

    // Apply discount if provided
    let discount = 0;
    let discountId = null;

    if (discountCode) {
      const discountObj = await prisma.discount.findUnique({
        where: {
          storeId_code: {
            storeId,
            code: discountCode.toUpperCase(),
          },
        },
      });

      if (discountObj && discountObj.isActive) {
        const now = new Date();
        const isValid =
          (!discountObj.startDate || discountObj.startDate <= now) &&
          (!discountObj.endDate || discountObj.endDate >= now) &&
          (!discountObj.maxUses || discountObj.usedCount < discountObj.maxUses) &&
          (!discountObj.minPurchase || subtotal >= Number(discountObj.minPurchase));

        if (isValid) {
          if (discountObj.type === 'PERCENTAGE') {
            discount = (subtotal * Number(discountObj.value)) / 100;
          } else {
            discount = Number(discountObj.value);
          }
          discountId = discountObj.id;
        }
      }
    }

    const tax = 0; // Calculate based on your tax rules
    const shipping = 0; // Calculate based on shipping rules
    const total = subtotal - discount + tax + shipping;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session?.user.id,
        storeId,
        status: 'PENDING',
        subtotal,
        discount,
        tax,
        shipping,
        total,
        discountId,
        customerName,
        customerEmail,
        customerPhone,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Update discount used count
    if (discountId) {
      await prisma.discount.update({
        where: { id: discountId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Create webhook event
    await prisma.webhookEvent.create({
      data: {
        orderId: order.id,
        event: 'order.created',
        payload: order,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
