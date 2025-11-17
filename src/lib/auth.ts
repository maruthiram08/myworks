import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/signin')
  }
  return user
}

export async function requireHost() {
  const user = await requireAuth()
  if (user.role !== 'HOST' && user.role !== 'ADMIN') {
    redirect('/')
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') {
    redirect('/')
  }
  return user
}
