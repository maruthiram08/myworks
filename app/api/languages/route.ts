import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      where: { isActive: true },
      include: {
        units: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
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
    const { name, code, flag, description } = body

    const language = await prisma.language.create({
      data: {
        name,
        code,
        flag,
        description,
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
