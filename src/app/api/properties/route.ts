import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'HOST' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'You must be a host to create properties' },
        { status: 403 }
      )
    }

    const body = await req.json()

    const property = await prisma.property.create({
      data: {
        hostId: session.user.id,
        title: body.title,
        description: body.description,
        type: body.type,
        category: body.category,
        country: body.country,
        state: body.state,
        city: body.city,
        address: body.address,
        zipCode: body.zipCode,
        latitude: body.latitude || 0,
        longitude: body.longitude || 0,
        guests: body.guests,
        bedrooms: body.bedrooms,
        beds: body.beds,
        bathrooms: body.bathrooms,
        amenities: body.amenities || [],
        pricePerNight: body.pricePerNight,
        cleaningFee: body.cleaningFee || 0,
        images: body.images || [],
        instantBook: body.instantBook || false,
        minNights: body.minNights || 1,
        maxNights: body.maxNights || 365,
        status: 'DRAFT',
      },
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error: any) {
    console.error('Create property error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to create property' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const hostId = searchParams.get('hostId')

    const where: any = {
      status: 'ACTIVE',
    }

    if (hostId) {
      where.hostId = hostId
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        host: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(properties)
  } catch (error: any) {
    console.error('Fetch properties error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}
