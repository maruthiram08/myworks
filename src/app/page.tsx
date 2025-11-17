import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PropertyCard } from '@/components/property-card'
import { SearchBar } from '@/components/search-bar'
import { CategoryFilter } from '@/components/category-filter'

export const dynamic = 'force-dynamic'

interface SearchParams {
  category?: string
  guests?: string
  checkIn?: string
  checkOut?: string
  minPrice?: string
  maxPrice?: string
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { category, guests, minPrice, maxPrice } = searchParams

  // Build where clause
  const where: any = {
    status: 'ACTIVE',
  }

  if (category && category !== 'all') {
    where.category = category
  }

  if (guests) {
    where.guests = {
      gte: parseInt(guests),
    }
  }

  if (minPrice || maxPrice) {
    where.pricePerNight = {}
    if (minPrice) {
      where.pricePerNight.gte = parseFloat(minPrice)
    }
    if (maxPrice) {
      where.pricePerNight.lte = parseFloat(maxPrice)
    }
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
    take: 50,
  })

  const categories = await prisma.property.groupBy({
    by: ['category'],
    where: {
      status: 'ACTIVE',
    },
    _count: {
      category: true,
    },
  })

  return (
    <div className="container py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold">Find Your Perfect Stay</h1>
        <SearchBar />
      </div>

      <CategoryFilter categories={categories} />

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {properties.length} {properties.length === 1 ? 'Property' : 'Properties'} Available
          </h2>
          <Link
            href="/map"
            className="text-sm font-medium text-primary hover:underline"
          >
            View on map
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-lg text-muted-foreground">
              No properties found matching your criteria.
            </p>
            <Link href="/" className="mt-4 text-primary hover:underline">
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
