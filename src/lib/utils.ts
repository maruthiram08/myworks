import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string, currency: string = 'USD') {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(numAmount)
}

export function formatDate(date: Date | string, format: 'short' | 'long' = 'short') {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function calculateNights(checkIn: Date, checkOut: Date): number {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function calculateTotalPrice(
  pricePerNight: number,
  nights: number,
  cleaningFee: number = 0,
  serviceFeePercentage: number = 10
) {
  const subtotal = pricePerNight * nights
  const serviceFee = subtotal * (serviceFeePercentage / 100)
  const total = subtotal + cleaningFee + serviceFee

  return {
    subtotal,
    cleaningFee,
    serviceFee,
    total,
  }
}

export function getAverageRating(reviews: Array<{ rating: number }>): number {
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}
