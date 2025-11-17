import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      type, difficulty, order, prompt, audioUrl, imageUrl,
      options, correctAnswer, alternativeAnswers, hint, explanation, points
    } = body

    const question = await prisma.question.update({
      where: { id: params.id },
      data: {
        type,
        difficulty,
        order,
        prompt,
        audioUrl,
        imageUrl,
        options: options ? JSON.stringify(options) : null,
        correctAnswer,
        alternativeAnswers: alternativeAnswers ? JSON.stringify(alternativeAnswers) : null,
        hint,
        explanation,
        points,
      },
    })

    return NextResponse.json(question)
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.question.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
  }
}
