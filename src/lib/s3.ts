import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Support both Cloudflare R2 and AWS S3
const s3Client = new S3Client({
  region: process.env.R2_ACCOUNT_ID ? 'auto' : process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.R2_ACCOUNT_ID
    ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : undefined,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey:
      process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME || ''

export async function getPresignedUploadUrl(
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
  return url
}

export function getPublicUrl(key: string): string {
  if (process.env.R2_PUBLIC_URL) {
    return `${process.env.R2_PUBLIC_URL}/${key}`
  }
  return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`
}

export function generateFileKey(userId: string, filename: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(7)
  const extension = filename.split('.').pop()
  return `uploads/${userId}/${timestamp}-${randomString}.${extension}`
}
