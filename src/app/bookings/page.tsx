import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function BookingsPage() {
  const user = await requireAuth()

  const bookings = await prisma.booking.findMany({
    where: {
      guestId: user.id,
    },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          images: true,
          city: true,
          state: true,
          country: true,
          host: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'CONFIRMED' && new Date(b.checkIn) > new Date()
  )
  const pastBookings = bookings.filter(
    (b) => b.status === 'COMPLETED' || (b.status === 'CONFIRMED' && new Date(b.checkOut) < new Date())
  )
  const cancelledBookings = bookings.filter(
    (b) => b.status === 'CANCELLED' || b.status === 'REFUNDED'
  )

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">My Trips</h1>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No trips yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Time to dust off your bags and start planning your next adventure
            </p>
            <Button asChild>
              <Link href="/">Start searching</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {upcomingBookings.length > 0 && (
            <div>
              <h2 className="mb-4 text-2xl font-semibold">Upcoming Trips</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            </div>
          )}

          {pastBookings.length > 0 && (
            <div>
              <h2 className="mb-4 text-2xl font-semibold">Past Trips</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} showReviewButton />
                ))}
              </div>
            </div>
          )}

          {cancelledBookings.length > 0 && (
            <div>
              <h2 className="mb-4 text-2xl font-semibold">Cancelled</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cancelledBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BookingCard({
  booking,
  showReviewButton = false,
}: {
  booking: any
  showReviewButton?: boolean
}) {
  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
  }

  return (
    <Card className="overflow-hidden">
      <Link href={`/bookings/${booking.id}`}>
        <div className="relative aspect-[16/9]">
          <Image
            src={booking.property.images[0] || '/placeholder.jpg'}
            alt={booking.property.title}
            fill
            className="object-cover"
          />
        </div>
      </Link>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-1">{booking.property.title}</CardTitle>
          <span className={`text-xs rounded-full px-2 py-1 ${statusColors[booking.status]}`}>
            {booking.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>
            {booking.property.city}, {booking.property.state}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Users className="h-4 w-4" />
          <span>
            {booking.adults} adults
            {booking.children > 0 && `, ${booking.children} children`}
          </span>
        </div>
        <div className="pt-2">
          <p className="text-lg font-semibold">{formatCurrency(booking.totalPrice)}</p>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/bookings/${booking.id}`}>View Details</Link>
          </Button>
          {showReviewButton && booking.status === 'COMPLETED' && (
            <Button size="sm" className="flex-1" asChild>
              <Link href={`/properties/${booking.property.id}/review`}>Write Review</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
