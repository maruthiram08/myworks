import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, bio, phone } = body

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        bio,
        phone,
      },
    })

    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to update profile' },
      { status: 500 }
    )
  }
}
