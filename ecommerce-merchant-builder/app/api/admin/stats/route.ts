import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [
      totalMerchants,
      totalBuyers,
      totalStores,
      totalProducts,
      totalOrders,
      revenue,
      recentOrders,
      topStores,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'MERCHANT' } }),
      prisma.user.count({ where: { role: 'BUYER' } }),
      prisma.store.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
        where: {
          status: {
            in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
          },
        },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          store: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.store.findMany({
        take: 10,
        include: {
          _count: {
            select: {
              orders: true,
              products: true,
            },
          },
          orders: {
            where: {
              status: {
                in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
              },
            },
            select: {
              total: true,
            },
          },
        },
      }),
    ]);

    const storesWithRevenue = topStores.map((store) => ({
      id: store.id,
      name: store.name,
      domain: store.domain,
      ordersCount: store._count.orders,
      productsCount: store._count.products,
      revenue: store.orders.reduce((sum, order) => sum + Number(order.total), 0),
    })).sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      stats: {
        totalMerchants,
        totalBuyers,
        totalStores,
        totalProducts,
        totalOrders,
        totalRevenue: Number(revenue._sum.total || 0),
      },
      recentOrders,
      topStores: storesWithRevenue,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
