'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Users } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, calculateNights, calculateTotalPrice } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface BookingCardProps {
  propertyId: string
  pricePerNight: number
  cleaningFee: number
  minNights: number
  maxGuests: number
  bookedDates: Array<{ start: Date; end: Date }>
}

export function BookingCard({
  propertyId,
  pricePerNight,
  cleaningFee,
  minNights,
  maxGuests,
  bookedDates,
}: BookingCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [loading, setLoading] = useState(false)

  const nights =
    checkIn && checkOut ? calculateNights(new Date(checkIn), new Date(checkOut)) : 0

  const pricing = nights > 0 ? calculateTotalPrice(pricePerNight, nights, cleaningFee) : null

  const handleBooking = async () => {
    if (!checkIn || !checkOut) {
      toast({
        title: 'Missing dates',
        description: 'Please select check-in and check-out dates',
        variant: 'destructive',
      })
      return
    }

    if (nights < minNights) {
      toast({
        title: 'Minimum stay requirement',
        description: `This property requires a minimum stay of ${minNights} nights`,
        variant: 'destructive',
      })
      return
    }

    if (guests > maxGuests) {
      toast({
        title: 'Too many guests',
        description: `This property can accommodate a maximum of ${maxGuests} guests`,
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          checkIn,
          checkOut,
          guests,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create booking')
      }

      const booking = await response.json()
      router.push(`/bookings/${booking.id}/checkout`)
    } catch (error: any) {
      toast({
        title: 'Booking failed',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold">{formatCurrency(pricePerNight)}</span>
            <span className="text-muted-foreground"> / night</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Check-in</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="pl-9"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Check-out</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="pl-9"
              min={checkIn || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Guests</Label>
          <div className="relative">
            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              min="1"
              max={maxGuests}
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              className="pl-9"
            />
          </div>
          <p className="text-xs text-muted-foreground">Maximum {maxGuests} guests</p>
        </div>

        {pricing && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(pricePerNight)} x {nights} nights
                </span>
                <span className="text-sm">{formatCurrency(pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cleaning fee</span>
                <span className="text-sm">{formatCurrency(pricing.cleaningFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Service fee</span>
                <span className="text-sm">{formatCurrency(pricing.serviceFee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(pricing.total)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleBooking}
          disabled={loading || !checkIn || !checkOut}
          className="w-full"
          size="lg"
        >
          {loading ? 'Processing...' : 'Reserve'}
        </Button>
      </CardFooter>
    </Card>
  )
}
