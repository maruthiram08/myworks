import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, ShoppingCart, DollarSign, Tag } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) return null;

  let stats = {
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCategories: 0,
  };

  if (session.user.role === 'MERCHANT') {
    const store = await prisma.store.findUnique({
      where: { userId: session.user.id },
    });

    if (store) {
      const [products, orders, categories, revenue] = await Promise.all([
        prisma.product.count({ where: { storeId: store.id } }),
        prisma.order.count({ where: { storeId: store.id } }),
        prisma.category.count({ where: { storeId: store.id } }),
        prisma.order.aggregate({
          where: {
            storeId: store.id,
            status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
          },
          _sum: { total: true },
        }),
      ]);

      stats = {
        totalProducts: products,
        totalOrders: orders,
        totalRevenue: Number(revenue._sum.total || 0),
        totalCategories: categories,
      };
    }
  } else if (session.user.role === 'BUYER') {
    const orders = await prisma.order.count({
      where: { userId: session.user.id },
    });

    stats.totalOrders = orders;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {session.user.role === 'MERCHANT' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(stats.totalRevenue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
                </div>
                <Tag className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Welcome to Your Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {session.user.role === 'MERCHANT' && 'Manage your store, products, and orders from here.'}
            {session.user.role === 'BUYER' && 'View your orders and track shipments.'}
            {session.user.role === 'ADMIN' && 'Monitor all merchants and platform activity.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
