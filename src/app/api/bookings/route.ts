import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { calculateNights, calculateTotalPrice } from '@/lib/utils'
import { PLATFORM_FEE_PERCENTAGE } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { propertyId, checkIn, checkOut, guests, adults = guests, children = 0, infants = 0 } = body

    if (!propertyId || !checkIn || !checkOut || !guests) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Get property
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        bookings: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED'],
            },
          },
          select: {
            checkIn: true,
            checkOut: true,
          },
        },
      },
    })

    if (!property) {
      return NextResponse.json({ message: 'Property not found' }, { status: 404 })
    }

    if (property.status !== 'ACTIVE') {
      return NextResponse.json({ message: 'Property is not available' }, { status: 400 })
    }

    // Check if dates are available
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const nights = calculateNights(checkInDate, checkOutDate)

    if (nights < property.minNights) {
      return NextResponse.json(
        { message: `Minimum stay is ${property.minNights} nights` },
        { status: 400 }
      )
    }

    if (nights > property.maxNights) {
      return NextResponse.json(
        { message: `Maximum stay is ${property.maxNights} nights` },
        { status: 400 }
      )
    }

    if (guests > property.guests) {
      return NextResponse.json(
        { message: `Property can only accommodate ${property.guests} guests` },
        { status: 400 }
      )
    }

    // Check for conflicts
    const hasConflict = property.bookings.some((booking) => {
      return checkInDate < booking.checkOut && checkOutDate > booking.checkIn
    })

    if (hasConflict) {
      return NextResponse.json(
        { message: 'Property is not available for selected dates' },
        { status: 400 }
      )
    }

    // Calculate pricing
    const pricing = calculateTotalPrice(
      Number(property.pricePerNight),
      nights,
      Number(property.cleaningFee),
      PLATFORM_FEE_PERCENTAGE
    )

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        guestId: session.user.id,
        propertyId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
        adults,
        children,
        infants,
        pricePerNight: property.pricePerNight,
        cleaningFee: property.cleaningFee,
        serviceFee: pricing.serviceFee,
        totalPrice: pricing.total,
        status: 'PENDING',
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            images: true,
            city: true,
            state: true,
          },
        },
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error: any) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
      where: {
        guestId: session.user.id,
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(bookings)
  } catch (error: any) {
    console.error('Fetching bookings error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
