import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Users, CreditCard, AlertCircle } from 'lucide-react'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CancelBookingButton } from '@/components/cancel-booking-button'

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const user = await requireAuth()

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      property: {
        include: {
          host: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
            },
          },
        },
      },
      payments: true,
    },
  })

  if (!booking) {
    notFound()
  }

  // Check authorization
  if (booking.guestId !== user.id) {
    redirect('/')
  }

  const canCancel = booking.status === 'CONFIRMED' && new Date(booking.checkIn) > new Date()

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/bookings" className="text-sm text-primary hover:underline">
          ← Back to trips
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Booking Details</CardTitle>
                <span
                  className={`text-sm rounded-full px-3 py-1 ${
                    booking.status === 'CONFIRMED'
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : booking.status === 'CANCELLED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Booking ID</p>
                <p className="font-mono text-sm">{booking.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Booked on</p>
                <p>{formatDate(booking.createdAt, 'long')}</p>
              </div>
              {booking.status === 'CANCELLED' && booking.cancelledAt && (
                <div className="rounded-lg bg-red-50 p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900">Booking Cancelled</p>
                      <p className="text-sm text-red-700">
                        Cancelled on {formatDate(booking.cancelledAt, 'long')}
                      </p>
                      {booking.cancelReason && (
                        <p className="text-sm text-red-700 mt-2">Reason: {booking.cancelReason}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/properties/${booking.property.id}`} className="block group">
                <div className="flex gap-4">
                  <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={booking.property.images[0] || '/placeholder.jpg'}
                      alt={booking.property.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary">
                      {booking.property.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {booking.property.city}, {booking.property.state}, {booking.property.country}
                    </p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Stay Details */}
          <Card>
            <CardHeader>
              <CardTitle>Your Stay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold">Check-in</p>
                      <p>{formatDate(booking.checkIn, 'long')}</p>
                      <p className="text-sm text-muted-foreground">After 3:00 PM</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Check-out</p>
                      <p>{formatDate(booking.checkOut, 'long')}</p>
                      <p className="text-sm text-muted-foreground">Before 11:00 AM</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{booking.nights} nights</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold">Guests</p>
                  <p>
                    {booking.adults} adults
                    {booking.children > 0 && `, ${booking.children} children`}
                    {booking.infants > 0 && `, ${booking.infants} infants`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Host Information */}
          <Card>
            <CardHeader>
              <CardTitle>Your Host</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                {booking.property.host.image && (
                  <Image
                    src={booking.property.host.image}
                    alt={booking.property.host.name || 'Host'}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{booking.property.host.name}</h3>
                  <p className="text-sm text-muted-foreground">{booking.property.host.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Price Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>
                  {formatCurrency(booking.pricePerNight)} × {booking.nights} nights
                </span>
                <span>{formatCurrency(Number(booking.pricePerNight) * booking.nights)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cleaning fee</span>
                <span>{formatCurrency(booking.cleaningFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Service fee</span>
                <span>{formatCurrency(booking.serviceFee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(booking.totalPrice)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          {booking.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {booking.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {payment.status === 'SUCCEEDED' ? 'Payment successful' : payment.status}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(payment.amount)} • {formatDate(payment.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {canCancel && (
            <Card>
              <CardHeader>
                <CardTitle>Need to cancel?</CardTitle>
              </CardHeader>
              <CardContent>
                <CancelBookingButton bookingId={booking.id} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
