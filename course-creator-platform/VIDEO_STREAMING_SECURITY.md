# Video Streaming Security Guide

This document explains how to implement secure video streaming for the Course Creator Platform, protecting your premium content from unauthorized access and sharing.

## Table of Contents
1. [Overview](#overview)
2. [Security Layers](#security-layers)
3. [Implementation Options](#implementation-options)
4. [Access Control](#access-control)
5. [Drip Content Integration](#drip-content-integration)
6. [Best Practices](#best-practices)

---

## Overview

Video streaming security ensures that:
- Only enrolled students can access course videos
- Videos cannot be easily downloaded or shared
- Content is delivered efficiently with CDN
- Drip scheduling is enforced
- Instructor preview access is allowed

### Current Implementation (Development)

The platform currently uses local file storage with basic access control:

```typescript
// app/api/upload/route.ts - GET endpoint
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const videoId = searchParams.get("videoId")
  const lectureId = searchParams.get("lectureId")

  // Check enrollment and access rights
  // Return signed URL or direct video URL
}
```

---

## Security Layers

### Layer 1: Authentication
Verify user identity before granting any access.

```typescript
const session = await getServerSession(authOptions)
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
```

### Layer 2: Enrollment Verification
Check if user is enrolled in the course.

```typescript
const enrollment = await prisma.enrollment.findUnique({
  where: {
    userId_courseId: {
      userId: session.user.id,
      courseId: lecture.section.course.id,
    },
  },
})

if (!enrollment && !isInstructor && !isAdmin) {
  return NextResponse.json({ error: "Not enrolled" }, { status: 403 })
}
```

### Layer 3: Drip Content Check
Verify if content should be available based on schedule.

```typescript
import { checkDripAccess } from "@/lib/utils"

const dripSchedule = await prisma.dripSchedule.findUnique({
  where: {
    courseId_lectureId: {
      courseId: lecture.section.courseId,
      lectureId: lecture.id,
    },
  },
})

if (dripSchedule) {
  const hasAccess = checkDripAccess(
    enrollment.enrolledAt,
    dripSchedule.daysAfterEnrollment
  )

  if (!hasAccess && !isInstructor) {
    return NextResponse.json(
      { error: "Content locked", unlockDate: calculateUnlockDate() },
      { status: 403 }
    )
  }
}
```

### Layer 4: Signed URLs
Generate time-limited, tamper-proof URLs.

```typescript
// Utility function for generating signed URLs
export function generateSignedUrl(
  videoId: string,
  userId: string,
  expiresIn: number = 3600
): string {
  const timestamp = Date.now() + expiresIn * 1000
  const data = `${videoId}:${userId}:${timestamp}`
  const signature = createHmac('sha256', process.env.VIDEO_SECRET!)
    .update(data)
    .digest('base64url')

  return `/api/video/${videoId}?expires=${timestamp}&signature=${signature}`
}
```

---

## Implementation Options

### Option 1: AWS S3 + CloudFront (Recommended)

**Advantages:**
- Highly scalable and reliable
- Global CDN with edge locations
- Signed URLs with custom policies
- Cost-effective for large files
- Automatic video transcoding with MediaConvert

**Implementation:**

```typescript
// lib/aws-video.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function uploadVideoToS3(
  file: File,
  courseId: string,
  lectureId: string
): Promise<string> {
  const key = `courses/${courseId}/lectures/${lectureId}/${file.name}`

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: await file.arrayBuffer(),
    ContentType: file.type,
  })

  await s3Client.send(command)
  return key
}

export async function generateSignedVideoUrl(
  videoKey: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: videoKey,
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}
```

**CloudFront Signed URLs:**

```typescript
// lib/cloudfront-signer.ts
import { getSignedUrl } from "@aws-sdk/cloudfront-signer"

export function generateCloudFrontUrl(
  videoKey: string,
  expiresIn: number = 3600
): string {
  const dateLessThan = new Date(Date.now() + expiresIn * 1000)

  return getSignedUrl({
    url: `https://${process.env.CLOUDFRONT_DOMAIN}/${videoKey}`,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
    privateKey: process.env.CLOUDFRONT_PRIVATE_KEY!,
    dateLessThan: dateLessThan.toISOString(),
  })
}
```

### Option 2: Cloudflare Stream

**Advantages:**
- Built-in video encoding and adaptive streaming
- Automatic thumbnail generation
- Simple API
- No egress fees
- Built-in analytics

**Implementation:**

```typescript
// lib/cloudflare-stream.ts
export async function uploadToCloudflareStream(
  file: File
): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      },
      body: formData,
    }
  )

  const data = await response.json()
  return data.result.uid // Video ID
}

export function generateStreamUrl(
  videoId: string,
  userId: string,
  expiresIn: number = 3600
): string {
  const exp = Math.floor(Date.now() / 1000) + expiresIn

  // Generate signed token
  const token = jwt.sign(
    {
      sub: videoId,
      kid: process.env.CLOUDFLARE_KEY_ID,
      exp,
      // Optional: Add user-specific claims
      userId,
    },
    process.env.CLOUDFLARE_SIGNING_KEY!,
    {
      algorithm: 'RS256',
    }
  )

  return `https://customer-${process.env.CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com/${videoId}/manifest/video.m3u8?token=${token}`
}
```

### Option 3: Azure Media Services

**Advantages:**
- Enterprise-grade security
- Dynamic encryption (DRM)
- Live streaming support
- Content protection with Widevine/PlayReady

**Implementation:**

```typescript
// lib/azure-media.ts
import { AzureMediaServices } from "@azure/arm-mediaservices"

export async function uploadToAzureMedia(
  file: File,
  assetName: string
): Promise<string> {
  // Create asset
  const asset = await mediaClient.assets.createOrUpdate(
    resourceGroup,
    accountName,
    assetName,
    {}
  )

  // Upload file to blob storage
  // Create streaming locator
  // Return streaming URL
}
```

### Option 4: Vimeo or Wistia (Third-Party)

**Advantages:**
- Managed solution, minimal setup
- Professional player with controls
- Built-in analytics
- Domain/email restrictions

**Implementation:**

```typescript
// lib/vimeo.ts
export async function uploadToVimeo(file: File): Promise<string> {
  const response = await fetch('https://api.vimeo.com/me/videos', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VIMEO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      upload: {
        approach: 'tus',
        size: file.size,
      },
      privacy: {
        view: 'disable', // Only via API
      },
      embed: {
        buttons: {
          download: false,
        },
      },
    }),
  })

  const data = await response.json()
  return data.uri
}
```

---

## Access Control

### Complete Access Control Flow

```typescript
// app/api/video/[videoId]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { checkDripAccess } from "@/lib/utils"
import { generateCloudFrontUrl } from "@/lib/cloudfront-signer"

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Get lecture details
    const lecture = await prisma.lecture.findFirst({
      where: { videoId: params.videoId },
      include: {
        section: {
          include: {
            course: {
              include: {
                enrollments: {
                  where: { userId: session.user.id },
                },
              },
            },
          },
        },
      },
    })

    if (!lecture) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const course = lecture.section.course
    const isEnrolled = course.enrollments.length > 0
    const isInstructor = course.instructorId === session.user.id
    const isAdmin = session.user.role === "ADMIN"
    const isFreePreview = lecture.isFree

    // 3. Check enrollment
    if (!isEnrolled && !isInstructor && !isAdmin && !isFreePreview) {
      return NextResponse.json(
        { error: "Enrollment required" },
        { status: 403 }
      )
    }

    // 4. Check drip schedule (skip for instructors/admins)
    if (isEnrolled && !isInstructor && !isAdmin) {
      const dripSchedule = await prisma.dripSchedule.findUnique({
        where: {
          courseId_lectureId: {
            courseId: course.id,
            lectureId: lecture.id,
          },
        },
      })

      if (dripSchedule) {
        const enrollment = course.enrollments[0]
        const hasAccess = checkDripAccess(
          enrollment.enrolledAt,
          dripSchedule.daysAfterEnrollment
        )

        if (!hasAccess) {
          const unlockDate = new Date(enrollment.enrolledAt)
          unlockDate.setDate(
            unlockDate.getDate() + dripSchedule.daysAfterEnrollment
          )

          return NextResponse.json(
            {
              error: "Content locked",
              unlockDate: unlockDate.toISOString(),
              daysRemaining: Math.ceil(
                (unlockDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              ),
            },
            { status: 403 }
          )
        }
      }
    }

    // 5. Generate signed URL
    const videoUrl = generateCloudFrontUrl(lecture.videoUrl!, 3600)

    // 6. Track access (optional)
    await prisma.lectureProgress.upsert({
      where: {
        userId_lectureId: {
          userId: session.user.id,
          lectureId: lecture.id,
        },
      },
      create: {
        userId: session.user.id,
        lectureId: lecture.id,
        lastWatchedAt: new Date(),
      },
      update: {
        lastWatchedAt: new Date(),
      },
    })

    return NextResponse.json({
      url: videoUrl,
      expiresIn: 3600,
      lecture: {
        id: lecture.id,
        title: lecture.title,
        duration: lecture.duration,
      },
    })
  } catch (error) {
    console.error("Error generating video URL:", error)
    return NextResponse.json(
      { error: "Failed to generate video URL" },
      { status: 500 }
    )
  }
}
```

---

## Drip Content Integration

### Database Setup

Already included in the schema:

```prisma
model DripSchedule {
  id                  String   @id @default(cuid())
  courseId            String
  lectureId           String
  daysAfterEnrollment Int
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  course  Course  @relation(fields: [courseId], references: [id])
  lecture Lecture @relation(fields: [lectureId], references: [id])

  @@unique([courseId, lectureId])
}
```

### Setting Up Drip Schedule

```typescript
// API route: POST /api/courses/[courseId]/drip-schedule
export async function POST(request: NextRequest) {
  const { lectureId, daysAfterEnrollment } = await request.json()

  const schedule = await prisma.dripSchedule.create({
    data: {
      courseId,
      lectureId,
      daysAfterEnrollment,
    },
  })

  return NextResponse.json(schedule)
}
```

### Checking Access

```typescript
// lib/utils.ts
export function checkDripAccess(
  enrollmentDate: Date,
  daysAfterEnrollment: number
): boolean {
  const now = new Date()
  const unlockDate = new Date(enrollmentDate)
  unlockDate.setDate(unlockDate.getDate() + daysAfterEnrollment)
  return now >= unlockDate
}
```

---

## Best Practices

### 1. Video Upload Processing

```typescript
// Process videos after upload
export async function processVideoUpload(videoId: string) {
  // 1. Generate multiple quality versions
  await transcodeVideo(videoId, ['1080p', '720p', '480p', '360p'])

  // 2. Generate thumbnail
  await generateThumbnail(videoId)

  // 3. Calculate duration
  const duration = await getVideoDuration(videoId)

  // 4. Update database
  await prisma.lecture.update({
    where: { videoId },
    data: { duration },
  })
}
```

### 2. Prevent Hotlinking

Add referrer checks:

```typescript
const referer = request.headers.get('referer')
const allowedDomains = [process.env.NEXTAUTH_URL, 'localhost:3000']

if (!allowedDomains.some(domain => referer?.includes(domain))) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}
```

### 3. Rate Limiting

Prevent abuse with rate limiting:

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 requests per hour
})

export async function checkRateLimit(userId: string) {
  const { success } = await ratelimit.limit(userId)
  return success
}
```

### 4. Watermarking

Add dynamic watermarks with user info:

```typescript
// When generating video URL, pass user session ID
// Video player overlays watermark with user email
// Makes sharing less attractive
```

### 5. DRM Protection (Optional)

For high-value content:

```typescript
// Use Widevine, PlayReady, or FairPlay
// Requires compatible video player
// Prevents screen recording (partially)
```

### 6. Monitoring and Analytics

Track video access:

```typescript
await prisma.videoAccessLog.create({
  data: {
    userId: session.user.id,
    lectureId,
    ipAddress: request.headers.get('x-forwarded-for'),
    userAgent: request.headers.get('user-agent'),
    timestamp: new Date(),
  },
})
```

### 7. Bandwidth Optimization

- Use adaptive bitrate streaming (HLS/DASH)
- Enable CDN caching
- Compress videos efficiently
- Use lazy loading for video thumbnails

---

## Security Checklist

- [ ] Implement authentication for all video requests
- [ ] Verify course enrollment before granting access
- [ ] Use signed URLs with expiration times
- [ ] Implement drip content scheduling
- [ ] Add referrer checking to prevent hotlinking
- [ ] Enable rate limiting on video endpoints
- [ ] Log video access for analytics and abuse detection
- [ ] Use HTTPS for all video requests
- [ ] Implement proper error handling (don't leak info)
- [ ] Monitor for suspicious download patterns
- [ ] Set appropriate CORS headers
- [ ] Disable video download controls in player
- [ ] Consider watermarking for premium content
- [ ] Regular security audits of video access logs

---

## Testing Video Security

### Test Cases

1. **Unauthenticated Access**
   ```bash
   curl https://yoursite.com/api/video/xyz123
   # Expected: 401 Unauthorized
   ```

2. **Unenrolled Student**
   ```bash
   curl -H "Authorization: Bearer <token>" \
        https://yoursite.com/api/video/xyz123
   # Expected: 403 Forbidden
   ```

3. **Expired Signed URL**
   ```bash
   # Wait for URL to expire, then try accessing
   # Expected: 403 Forbidden or URL error
   ```

4. **Drip Content Lock**
   ```bash
   # Try accessing locked lecture
   # Expected: 403 with unlock date
   ```

5. **Instructor Override**
   ```bash
   # Instructor should access any lecture
   # Expected: 200 OK with video URL
   ```

---

## Cost Optimization

### Storage Costs
- S3: ~$0.023/GB/month
- Cloudflare Stream: $1/1000 minutes stored
- Azure: ~$0.02/GB/month

### Bandwidth Costs
- CloudFront: $0.085/GB (first 10TB)
- Cloudflare Stream: $1/1000 minutes delivered
- Azure CDN: $0.087/GB

### Recommendations
1. Use CloudFront/CDN for delivery
2. Delete old video versions after processing
3. Implement video compression
4. Use lower bitrates for mobile users
5. Cache thumbnails aggressively

---

## Troubleshooting

### Common Issues

**Issue: Videos not playing**
- Check signed URL expiration
- Verify CORS headers
- Ensure video format compatibility

**Issue: Slow video loading**
- Enable CDN caching
- Use adaptive bitrate streaming
- Check server location vs. user location

**Issue: Unauthorized access**
- Verify session token
- Check enrollment status
- Review drip schedule logic

---

## Additional Resources

- [AWS CloudFront Signed URLs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-urls.html)
- [Cloudflare Stream Docs](https://developers.cloudflare.com/stream/)
- [HLS Specification](https://datatracker.ietf.org/doc/html/rfc8216)
- [OWASP Video Security](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
