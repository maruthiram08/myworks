import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getPresignedUploadUrl, generateFileKey } from '@/lib/s3'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { filename, contentType } = body

    if (!filename || !contentType) {
      return NextResponse.json(
        { message: 'Missing filename or contentType' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { message: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    const key = generateFileKey(session.user.id, filename)
    const uploadUrl = await getPresignedUploadUrl(key, contentType)

    return NextResponse.json({ uploadUrl, key })
  } catch (error: any) {
    console.error('Upload URL generation error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}
