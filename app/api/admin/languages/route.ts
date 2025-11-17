import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const languages = await prisma.language.findMany({
      include: {
        _count: {
          select: {
            units: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(languages)
  } catch (error) {
    console.error('Error fetching languages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch languages' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, code, flag, description, isActive } = body

    if (!name || !code || !flag) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const language = await prisma.language.create({
      data: {
        name,
        code,
        flag,
        description,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(language)
  } catch (error) {
    console.error('Error creating language:', error)
    return NextResponse.json(
      { error: 'Failed to create language' },
      { status: 500 }
    )
  }
}
