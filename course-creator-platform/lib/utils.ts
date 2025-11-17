import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price)
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export function generateSignedUrl(videoId: string, expiresIn: number = 3600): string {
  // This is a placeholder - implement actual signed URL generation
  // using your video provider (AWS S3, Cloudflare Stream, etc.)
  const timestamp = Date.now() + expiresIn * 1000
  const signature = Buffer.from(`${videoId}:${timestamp}`).toString('base64')
  return `/api/video/${videoId}?expires=${timestamp}&signature=${signature}`
}

export function checkDripAccess(enrollmentDate: Date, daysAfterEnrollment: number): boolean {
  const now = new Date()
  const unlockDate = new Date(enrollmentDate)
  unlockDate.setDate(unlockDate.getDate() + daysAfterEnrollment)
  return now >= unlockDate
}
