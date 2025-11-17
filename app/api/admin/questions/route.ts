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
    const challengeId = searchParams.get('challengeId')

    const questions = await prisma.question.findMany({
      where: challengeId ? { challengeId } : undefined,
      include: {
        challenge: {
          include: {
            lesson: {
              include: {
                unit: {
                  include: { language: true },
                },
              },
            },
          },
        },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      challengeId, type, difficulty, order, prompt, audioUrl, imageUrl,
      options, correctAnswer, alternativeAnswers, hint, explanation, points
    } = body

    const question = await prisma.question.create({
      data: {
        challengeId,
        type,
        difficulty,
        order: order || 1,
        prompt,
        audioUrl,
        imageUrl,
        options: options ? JSON.stringify(options) : null,
        correctAnswer,
        alternativeAnswers: alternativeAnswers ? JSON.stringify(alternativeAnswers) : null,
        hint,
        explanation,
        points: points || 10,
      },
    })

    return NextResponse.json(question)
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
  }
}
