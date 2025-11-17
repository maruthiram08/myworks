'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
    } else {
      // Redirect based on role
      if (session.user.role === 'DRIVER') {
        router.push('/driver/dashboard')
      } else if (session.user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        router.push('/rider/dashboard')
      }
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
      <div className="spinner"></div>
    </div>
  )
}
