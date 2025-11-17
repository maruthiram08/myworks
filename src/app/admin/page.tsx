import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Home, Calendar, DollarSign, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminDashboardPage() {
  await requireAdmin()

  const [
    totalUsers,
    totalProperties,
    totalBookings,
    pendingProperties,
    recentUsers,
    recentProperties,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.property.count(),
    prisma.booking.count(),
    prisma.property.count({ where: { status: 'DRAFT' } }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.property.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        host: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ])

  const totalEarnings = await prisma.booking.aggregate({
    where: {
      status: {
        in: ['CONFIRMED', 'COMPLETED'],
      },
    },
    _sum: {
      totalPrice: true,
    },
  })

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProperties}</div>
            {pendingProperties > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {pendingProperties} pending approval
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(Number(totalEarnings._sum.totalPrice) || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions */}
      {pendingProperties > 0 && (
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center justify-between pt-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-900">
                  {pendingProperties} properties awaiting approval
                </p>
                <p className="text-sm text-yellow-700">
                  Review and approve new property listings
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/admin/properties">Review Properties</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Users</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/users">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{user.name || 'No name'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <span className="text-xs rounded-full bg-primary/10 px-2 py-1">
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Properties */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Properties</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/properties">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProperties.map((property) => (
                <div key={property.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">{property.title}</p>
                    <p className="text-sm text-muted-foreground">
                      by {property.host.name} • {property.city}, {property.state}
                    </p>
                  </div>
                  <span
                    className={`text-xs rounded-full px-2 py-1 ml-2 ${
                      property.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : property.status === 'DRAFT'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {property.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
