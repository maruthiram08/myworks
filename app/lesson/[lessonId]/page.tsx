import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { LessonInterface } from "@/components/LessonInterface"

export default async function LessonPage({
  params,
}: {
  params: { lessonId: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      unit: {
        include: {
          language: true,
        },
      },
      challenges: {
        orderBy: { order: 'asc' },
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })

  if (!lesson) {
    redirect("/learn")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    redirect("/auth/signin")
  }

  return <LessonInterface lesson={lesson} user={user} />
}
