import Link from 'next/link'
import { Plus, Home, Calendar, DollarSign, Star } from 'lucide-react'
import { requireHost } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, getAverageRating } from '@/lib/utils'

export default async function HostDashboardPage() {
  const user = await requireHost()

  const properties = await prisma.property.findMany({
    where: {
      hostId: user.id,
    },
    include: {
      reviews: {
        select: {
          rating: true,
        },
      },
      bookings: {
        where: {
          status: 'CONFIRMED',
        },
        select: {
          totalPrice: true,
        },
      },
      _count: {
        select: {
          bookings: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const totalEarnings = properties.reduce((sum, property) => {
    const propertyEarnings = property.bookings.reduce(
      (total, booking) => total + Number(booking.totalPrice),
      0
    )
    return sum + propertyEarnings
  }, 0)

  const totalBookings = properties.reduce((sum, property) => sum + property._count.bookings, 0)

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Host Dashboard</h1>
          <p className="text-muted-foreground">Manage your properties and bookings</p>
        </div>
        <Button asChild>
          <Link href="/host/properties/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
            <p className="text-xs text-muted-foreground">
              {properties.filter((p) => p.status === 'ACTIVE').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">Across all properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Properties List */}
      <div>
        <h2 className="mb-4 text-2xl font-semibold">Your Properties</h2>
        {properties.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Home className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No properties yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Get started by adding your first property
              </p>
              <Button asChild>
                <Link href="/host/properties/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => {
              const avgRating = getAverageRating(property.reviews)
              const earnings = property.bookings.reduce(
                (sum, booking) => sum + Number(booking.totalPrice),
                0
              )

              return (
                <Card key={property.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-1">{property.title}</CardTitle>
                        <CardDescription>
                          {property.city}, {property.state}
                        </CardDescription>
                      </div>
                      <span
                        className={`text-xs rounded-full px-2 py-1 ${
                          property.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : property.status === 'DRAFT'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {property.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Price/night</p>
                        <p className="font-semibold">{formatCurrency(property.pricePerNight)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Bookings</p>
                        <p className="font-semibold">{property._count.bookings}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rating</p>
                        <div className="flex items-center space-x-1">
                          {property.reviews.length > 0 ? (
                            <>
                              <Star className="h-4 w-4 fill-current text-yellow-400" />
                              <span className="font-semibold">{avgRating}</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">No reviews</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Earnings</p>
                        <p className="font-semibold">{formatCurrency(earnings)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/properties/${property.id}`}>View</Link>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/host/properties/${property.id}/edit`}>Edit</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
