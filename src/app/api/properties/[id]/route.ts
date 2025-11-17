import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        host: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
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

    return NextResponse.json(property)
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to fetch property' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const property = await prisma.property.findUnique({
      where: { id: params.id },
    })

    if (!property) {
      return NextResponse.json({ message: 'Property not found' }, { status: 404 })
    }

    if (property.hostId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()

    const updatedProperty = await prisma.property.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        category: body.category,
        country: body.country,
        state: body.state,
        city: body.city,
        address: body.address,
        zipCode: body.zipCode,
        latitude: body.latitude,
        longitude: body.longitude,
        guests: body.guests,
        bedrooms: body.bedrooms,
        beds: body.beds,
        bathrooms: body.bathrooms,
        amenities: body.amenities,
        pricePerNight: body.pricePerNight,
        cleaningFee: body.cleaningFee,
        images: body.images,
        instantBook: body.instantBook,
        minNights: body.minNights,
        maxNights: body.maxNights,
        status: body.status || property.status,
      },
    })

    return NextResponse.json(updatedProperty)
  } catch (error: any) {
    console.error('Update property error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to update property' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const property = await prisma.property.findUnique({
      where: { id: params.id },
    })

    if (!property) {
      return NextResponse.json({ message: 'Property not found' }, { status: 404 })
    }

    if (property.hostId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    await prisma.property.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Property deleted successfully' })
  } catch (error: any) {
    console.error('Delete property error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to delete property' },
      { status: 500 }
    )
  }
}
