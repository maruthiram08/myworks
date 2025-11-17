import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Star, MapPin, Users, Bed, Bath, Wifi, Calendar } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatCurrency, getAverageRating } from '@/lib/utils'
import { AMENITIES } from '@/lib/constants'
import { BookingCard } from '@/components/booking-card'
import { ReviewsList } from '@/components/reviews-list'
import { Separator } from '@/components/ui/separator'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    select: { title: true, description: true, images: true, city: true, state: true },
  })

  if (!property) {
    return {
      title: 'Property Not Found',
    }
  }

  return {
    title: `${property.title} - ${property.city}, ${property.state}`,
    description: property.description,
    openGraph: {
      images: property.images[0] ? [property.images[0]] : [],
    },
  }
}

export default async function PropertyPage({ params }: { params: { id: string } }) {
  const property = await prisma.property.findUnique({
    where: { id: params.id, status: 'ACTIVE' },
    include: {
      host: {
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
          createdAt: true,
        },
      },
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
        orderBy: {
          createdAt: 'desc',
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
    notFound()
  }

  const avgRating = getAverageRating(property.reviews)
  const reviewCount = property.reviews.length

  // Get amenity details
  const propertyAmenities = AMENITIES.filter((a) =>
    property.amenities.some((pa) => pa.toLowerCase() === a.id || pa === a.name)
  )

  return (
    <div className="container py-8">
      <h1 className="mb-4 text-3xl font-bold">{property.title}</h1>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {reviewCount > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="h-5 w-5 fill-current text-yellow-400" />
              <span className="font-semibold">{avgRating}</span>
              <span className="text-muted-foreground">({reviewCount} reviews)</span>
            </div>
          )}
          <div className="flex items-center space-x-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {property.city}, {property.state}, {property.country}
            </span>
          </div>
        </div>
      </div>

      {/* Images Grid */}
      <div className="mb-8 grid gap-2 md:grid-cols-4 md:grid-rows-2">
        {property.images.slice(0, 5).map((image, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-lg ${
              index === 0 ? 'md:col-span-2 md:row-span-2 h-[400px]' : 'h-[196px]'
            }`}
          >
            <Image src={image} alt={`${property.title} - ${index + 1}`} fill className="object-cover" />
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Property Info */}
          <div>
            <h2 className="mb-2 text-2xl font-semibold">
              {property.type.replace('_', ' ')} hosted by {property.host.name}
            </h2>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{property.guests} guests</span>
              </div>
              <div className="flex items-center space-x-1">
                <Bed className="h-4 w-4" />
                <span>{property.bedrooms} bedrooms</span>
              </div>
              <div className="flex items-center space-x-1">
                <Bath className="h-4 w-4" />
                <span>{property.bathrooms} bathrooms</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="mb-4 text-xl font-semibold">About this place</h3>
            <p className="text-muted-foreground whitespace-pre-line">{property.description}</p>
          </div>

          <Separator />

          {/* Amenities */}
          <div>
            <h3 className="mb-4 text-xl font-semibold">Amenities</h3>
            <div className="grid grid-cols-2 gap-4">
              {propertyAmenities.map((amenity) => (
                <div key={amenity.id} className="flex items-center space-x-3">
                  <span className="text-2xl">{amenity.icon}</span>
                  <span>{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Calendar */}
          <div>
            <h3 className="mb-4 text-xl font-semibold">Availability</h3>
            <div className="rounded-lg border p-4">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Calendar className="h-5 w-5" />
                <span>Minimum stay: {property.minNights} nights</span>
              </div>
              {property.maxNights < 365 && (
                <div className="mt-2 flex items-center space-x-2 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>Maximum stay: {property.maxNights} nights</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Reviews */}
          {reviewCount > 0 && (
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <Star className="h-6 w-6 fill-current text-yellow-400" />
                <h3 className="text-xl font-semibold">
                  {avgRating} · {reviewCount} reviews
                </h3>
              </div>
              <ReviewsList reviews={property.reviews} />
            </div>
          )}

          <Separator />

          {/* Host Info */}
          <div>
            <h3 className="mb-4 text-xl font-semibold">Meet your host</h3>
            <div className="flex items-start space-x-4">
              {property.host.image && (
                <Image
                  src={property.host.image}
                  alt={property.host.name || 'Host'}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              )}
              <div>
                <h4 className="text-lg font-semibold">{property.host.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Joined {new Date(property.host.createdAt).getFullYear()}
                </p>
                {property.host.bio && (
                  <p className="mt-2 text-muted-foreground">{property.host.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="mb-4 text-xl font-semibold">Location</h3>
            <p className="text-muted-foreground">
              {property.city}, {property.state}, {property.country}
            </p>
            <div className="mt-4 h-[300px] rounded-lg bg-muted" />
          </div>
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <BookingCard
              propertyId={property.id}
              pricePerNight={Number(property.pricePerNight)}
              cleaningFee={Number(property.cleaningFee)}
              minNights={property.minNights}
              maxGuests={property.guests}
              bookedDates={property.bookings.map((b) => ({
                start: b.checkIn,
                end: b.checkOut,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
