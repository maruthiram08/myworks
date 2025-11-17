import { requireHost } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Users, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import * as Tabs from '@radix-ui/react-tabs'

export default async function HostBookingsPage() {
  const user = await requireHost()

  const bookings = await prisma.booking.findMany({
    where: {
      property: {
        hostId: user.id,
      },
    },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          images: true,
        },
      },
      guest: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
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
  const currentBookings = bookings.filter(
    (b) => b.status === 'CONFIRMED' &&
    new Date(b.checkIn) <= new Date() &&
    new Date(b.checkOut) >= new Date()
  )
  const pastBookings = bookings.filter(
    (b) => b.status === 'COMPLETED' || (b.status === 'CONFIRMED' && new Date(b.checkOut) < new Date())
  )

  const totalEarnings = bookings
    .filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + Number(b.totalPrice), 0)

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Manage Bookings</h1>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBookings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentBookings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Tabs.Root defaultValue="upcoming" className="space-y-4">
        <Tabs.List className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          <Tabs.Trigger
            value="upcoming"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Upcoming ({upcomingBookings.length})
          </Tabs.Trigger>
          <Tabs.Trigger
            value="current"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Current ({currentBookings.length})
          </Tabs.Trigger>
          <Tabs.Trigger
            value="past"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Past ({pastBookings.length})
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="upcoming" className="space-y-4">
          <BookingsList bookings={upcomingBookings} />
        </Tabs.Content>

        <Tabs.Content value="current" className="space-y-4">
          <BookingsList bookings={currentBookings} />
        </Tabs.Content>

        <Tabs.Content value="past" className="space-y-4">
          <BookingsList bookings={pastBookings} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}

function BookingsList({ bookings }: { bookings: any[] }) {
  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No bookings in this category</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={booking.property.images[0] || '/placeholder.jpg'}
                  alt={booking.property.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{booking.property.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Guest: {booking.guest.name} ({booking.guest.email})
                    </p>
                  </div>
                  <span
                    className={`text-xs rounded-full px-2 py-1 ${
                      booking.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{booking.adults} guests</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatCurrency(booking.totalPrice)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/host/bookings/${booking.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
