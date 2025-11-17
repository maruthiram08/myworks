import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const languageId = searchParams.get('languageId')

    const units = await prisma.unit.findMany({
      where: languageId ? { languageId } : undefined,
      include: {
        language: true,
        _count: {
          select: { lessons: true },
        },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(units)
  } catch (error) {
    console.error('Error fetching units:', error)
    return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { languageId, title, description, order, color, isLocked } = body

    const unit = await prisma.unit.create({
      data: { languageId, title, description, order: order || 1, color, isLocked: isLocked ?? false },
      include: { language: true },
    })

    return NextResponse.json(unit)
  } catch (error) {
    console.error('Error creating unit:', error)
    return NextResponse.json({ error: 'Failed to create unit' }, { status: 500 })
  }
}
