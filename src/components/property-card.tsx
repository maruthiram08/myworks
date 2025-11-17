import Link from 'next/link'
import Image from 'next/image'
import { Heart, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, getAverageRating } from '@/lib/utils'

interface PropertyCardProps {
  property: {
    id: string
    title: string
    images: string[]
    pricePerNight: number | string
    city: string
    state: string
    country: string
    guests: number
    bedrooms: number
    bathrooms: number
    reviews: { rating: number }[]
    _count?: {
      reviews: number
    }
  }
}

export function PropertyCard({ property }: PropertyCardProps) {
  const avgRating = getAverageRating(property.reviews)
  const reviewCount = property._count?.reviews || 0

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow">
      <Link href={`/properties/${property.id}`}>
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={property.images[0] || '/placeholder.jpg'}
            alt={property.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 rounded-full bg-white/80 hover:bg-white"
            onClick={(e) => {
              e.preventDefault()
              // Handle wishlist toggle
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold line-clamp-1">{property.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {property.city}, {property.state}
                </p>
              </div>
              {reviewCount > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <span className="text-sm font-medium">{avgRating}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {property.guests} guests · {property.bedrooms} bedrooms · {property.bathrooms}{' '}
              bathrooms
            </p>
            <div className="pt-2">
              <span className="text-lg font-semibold">
                {formatCurrency(property.pricePerNight)}
              </span>
              <span className="text-sm text-muted-foreground"> / night</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
