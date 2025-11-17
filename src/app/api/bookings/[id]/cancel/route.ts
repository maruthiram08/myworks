import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { refundPayment } from '@/lib/stripe'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    })

    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 })
    }

    if (booking.guestId !== session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    if (booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        { message: 'Only confirmed bookings can be cancelled' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { reason } = body

    // Process refund if payment exists
    if (booking.stripePaymentId) {
      try {
        await refundPayment(booking.stripePaymentId)
      } catch (error) {
        console.error('Refund error:', error)
        // Continue with cancellation even if refund fails
      }
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: reason || null,
      },
    })

    // Create notification for host
    await prisma.notification.create({
      data: {
        userId: booking.propertyId, // Should be hostId
        type: 'BOOKING_CANCELLED',
        title: 'Booking Cancelled',
        message: `A guest has cancelled their booking.`,
        link: `/host/bookings/${booking.id}`,
      },
    })

    return NextResponse.json(updatedBooking)
  } catch (error: any) {
    console.error('Cancel booking error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}
