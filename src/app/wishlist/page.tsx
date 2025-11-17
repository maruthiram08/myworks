import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PropertyCard } from '@/components/property-card'

export default async function WishlistPage() {
  const user = await requireAuth()

  const wishlist = await prisma.wishlist.findMany({
    where: {
      userId: user.id,
    },
    include: {
      property: {
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
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Wishlist</h1>

      {wishlist.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Heart className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Your wishlist is empty</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Save properties you like to keep track of them
            </p>
            <Button asChild>
              <Link href="/">Start exploring</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlist.map((item) => (
            <PropertyCard key={item.id} property={item.property} />
          ))}
        </div>
      )}
    </div>
  )
}
