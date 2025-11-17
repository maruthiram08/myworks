import Image from 'next/image'
import { Star } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface ReviewsListProps {
  reviews: Review[]
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  return (
    <div className="space-y-6">
      {reviews.slice(0, 6).map((review, index) => (
        <div key={review.id}>
          <div className="flex items-start space-x-4">
            {review.user.image ? (
              <Image
                src={review.user.image}
                alt={review.user.name || 'User'}
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <span className="text-lg font-semibold">
                  {review.user.name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{review.user.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(review.createdAt, 'long')}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <span className="font-medium">{review.rating}</span>
                </div>
              </div>
              <p className="mt-2 text-muted-foreground">{review.comment}</p>
            </div>
          </div>
          {index < reviews.length - 1 && index < 5 && <Separator className="mt-6" />}
        </div>
      ))}
      {reviews.length > 6 && (
        <p className="text-center text-sm text-muted-foreground">
          Showing 6 of {reviews.length} reviews
        </p>
      )}
    </div>
  )
}
