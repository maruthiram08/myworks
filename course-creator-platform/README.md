# Course Creator Platform

A full-featured online learning platform built with Next.js 14, TypeScript, and PostgreSQL. Instructors can create and sell courses with video content, PDFs, and quizzes. Students can enroll, track progress, and participate in course discussions.

## Features

### For Instructors
- **Course Management**: Create, edit, and publish courses
- **Content Upload**: Upload videos, PDFs, and create quiz modules
- **Drip Content Scheduling**: Control when students can access specific lectures
- **Analytics Dashboard**: Track student enrollments, revenue, and course performance
- **Discussion Moderation**: Monitor and manage course forums

### For Students
- **Course Enrollment**: Browse and enroll in courses (free or paid)
- **Progress Tracking**: Automatic tracking of lecture completion and quiz results
- **Video Player**: Secure video streaming with progress saving
- **Reviews & Ratings**: Leave feedback on completed courses
- **Discussion Forums**: Engage with instructors and fellow students

### For Admins
- **Category Management**: Create and organize course categories
- **Content Moderation**: Review and moderate user-generated content
- **User Management**: Manage instructor and student accounts
- **Platform Analytics**: Overview of all platform activities

### Payment & Monetization
- **Stripe Integration**: Secure payment processing
- **Multiple Pricing Models**: Free, one-time payment, or subscription-based courses
- **Automatic Enrollment**: Students are enrolled automatically after successful payment

### Technical Features
- **SEO Optimized**: Server-side rendering with proper meta tags and structured data
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Secure Video Streaming**: Signed URLs with access control
- **Role-Based Access Control**: Student, Instructor, and Admin roles
- **Database Migrations**: Prisma ORM for type-safe database access

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Payment**: Stripe
- **File Upload**: Local storage (easily replaceable with AWS S3/Cloudflare R2)
- **UI Components**: Radix UI, Lucide Icons

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Stripe account (for payments)
- (Optional) AWS S3 or Cloudflare Stream account (for production video hosting)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd course-creator-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/course_platform"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

# Optional: OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AWS S3 (for video/PDF storage - optional)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="course-platform-videos"

# Cloudflare Stream (alternative to S3 - optional)
CLOUDFLARE_ACCOUNT_ID="your-account-id"
CLOUDFLARE_API_TOKEN="your-api-token"
```

### 4. Set up the database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database with sample data
npx prisma db seed
```

### 5. Create upload directories

```bash
mkdir -p public/uploads/videos public/uploads/pdfs
```

### 6. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

The platform uses a comprehensive database schema with the following main models:

### User Management
- **User**: Students, instructors, and admins with role-based access
- **Account**: OAuth provider accounts
- **Session**: User sessions for authentication

### Course Structure
- **Category**: Course categories for organization
- **Course**: Main course entity with pricing, metadata, and SEO fields
- **Section**: Course sections/modules
- **Lecture**: Individual lectures (video, PDF, article, or quiz)

### Quiz System
- **Quiz**: Quiz configuration
- **QuizQuestion**: Individual questions with multiple types
- **QuizOption**: Answer choices for multiple-choice questions
- **QuizAttempt**: Student quiz attempts
- **QuizAnswer**: Individual answers within attempts

### Progress Tracking
- **Enrollment**: Student course enrollments
- **LectureProgress**: Per-lecture completion and watch time
- **DripSchedule**: Content scheduling rules

### Social Features
- **Review**: Course ratings and reviews
- **Discussion**: Course discussion boards
- **DiscussionPost**: Forum posts and replies

### Payments
- **Payment**: Transaction records for Stripe payments

## API Routes

### Courses
- `GET /api/courses` - List all published courses
- `POST /api/courses` - Create a new course (instructor only)
- `GET /api/courses/[courseId]` - Get course details
- `PATCH /api/courses/[courseId]` - Update course (instructor only)
- `DELETE /api/courses/[courseId]` - Delete course (instructor only)

### Enrollments
- `GET /api/enrollments` - Get user enrollments
- `POST /api/enrollments` - Enroll in a course

### Progress
- `GET /api/progress` - Get progress for a course or lecture
- `POST /api/progress` - Update lecture progress

### Reviews
- `GET /api/reviews` - Get course reviews
- `POST /api/reviews` - Create or update review

### Discussions
- `GET /api/discussions` - Get course discussions
- `POST /api/discussions` - Create a discussion post

### Stripe
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks

### Upload
- `POST /api/upload` - Upload video or PDF file
- `GET /api/upload` - Get signed video URL

## Video Streaming Security

The platform implements secure video streaming:

1. **Access Control**: Videos are only accessible to enrolled students
2. **Signed URLs**: Temporary URLs with expiration times
3. **Drip Content**: Lectures unlock based on enrollment date
4. **Progress Tracking**: Watch time and completion status

### Implementation Options

**Development (Current)**:
- Files stored in `public/uploads/videos`
- Direct serving through Next.js

**Production (Recommended)**:
- AWS S3 + CloudFront with signed URLs
- Cloudflare Stream with signed tokens
- Azure Media Services
- Vimeo or Wistia API

## Drip Content Scheduling

Control when students can access content:

1. Set days after enrollment for each lecture
2. Automatic unlock based on enrollment date
3. Manual override for instructors
4. Preview mode for free lectures

Example:
```typescript
// Lecture unlocks 7 days after enrollment
await prisma.dripSchedule.create({
  data: {
    courseId: "course-id",
    lectureId: "lecture-id",
    daysAfterEnrollment: 7,
  },
})
```

## Stripe Integration

### Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Add keys to `.env` file
4. Set up webhook endpoint:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `payment_intent.payment_failed`

### Testing

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
# Build image
docker build -t course-platform .

# Run container
docker run -p 3000:3000 course-platform
```

### Database

Use a managed PostgreSQL service:
- Vercel Postgres
- Supabase
- Railway
- AWS RDS
- Digital Ocean

## Production Checklist

- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Set up video hosting (S3/Cloudflare Stream)
- [ ] Configure Stripe webhook
- [ ] Set up email service for notifications
- [ ] Configure CDN for static assets
- [ ] Enable database backups
- [ ] Set up monitoring and error tracking
- [ ] Configure CORS and security headers
- [ ] Set up SSL certificate
- [ ] Test payment flow end-to-end
- [ ] Set up analytics (Google Analytics, Plausible, etc.)

## Security Considerations

- All API routes validate user authentication
- Role-based access control for sensitive operations
- SQL injection prevention via Prisma ORM
- XSS protection with React's built-in escaping
- CSRF protection via NextAuth.js
- Secure password hashing with bcrypt
- Environment variables for sensitive data
- Rate limiting on API routes (recommended to add)

## File Structure

```
course-creator-platform/
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── courses/          # Course listing & detail pages
│   ├── instructor/       # Instructor dashboard
│   ├── student/          # Student dashboard
│   ├── learn/            # Course player
│   └── page.tsx          # Home page
├── components/
│   ├── ui/               # Reusable UI components
│   └── shared/           # Shared components
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static files
└── types/                # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - feel free to use this project for commercial purposes.

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review the Prisma schema for database structure

## Roadmap

Future enhancements:
- [ ] Live streaming support
- [ ] Certificate generation
- [ ] Multi-language support
- [ ] Mobile apps (React Native)
- [ ] Advanced analytics
- [ ] Bulk upload tools
- [ ] Assignment submissions
- [ ] Peer review system
- [ ] Gamification features
- [ ] API for third-party integrations

## Credits

Built with:
- Next.js
- Prisma
- NextAuth.js
- Stripe
- Tailwind CSS
- Radix UI
