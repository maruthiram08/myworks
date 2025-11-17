import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Toaster } from '@/components/ui/toaster'
import { auth } from '@/auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VacationRentals - Find Your Perfect Stay',
  description:
    'Discover and book unique vacation rentals around the world. From beachfront villas to mountain cabins, find your perfect getaway.',
  keywords: [
    'vacation rentals',
    'holiday homes',
    'short-term rentals',
    'accommodation',
    'travel',
  ],
  authors: [{ name: 'VacationRentals' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'VacationRentals - Find Your Perfect Stay',
    description:
      'Discover and book unique vacation rentals around the world. From beachfront villas to mountain cabins, find your perfect getaway.',
    siteName: 'VacationRentals',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VacationRentals - Find Your Perfect Stay',
    description:
      'Discover and book unique vacation rentals around the world. From beachfront villas to mountain cabins, find your perfect getaway.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Navbar user={session?.user} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  )
}
