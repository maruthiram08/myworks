# Database Schema Documentation

This document provides detailed information about the database schema for the Course Creator Platform.

## Schema Overview

The database consists of 19 main tables organized into 6 functional groups:

1. **User Management** - Authentication and user profiles
2. **Course Structure** - Courses, sections, and lectures
3. **Quiz System** - Quizzes, questions, and student attempts
4. **Progress Tracking** - Enrollments and completion tracking
5. **Social Features** - Reviews and discussions
6. **Payments** - Transaction records

## Detailed Schema

### User Management

#### User
Stores user accounts with role-based access control.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| name | String? | User's display name |
| email | String | Unique email address |
| emailVerified | DateTime? | Email verification timestamp |
| image | String? | Profile image URL |
| password | String? | Hashed password (bcrypt) |
| role | UserRole | STUDENT, INSTRUCTOR, or ADMIN |
| bio | Text? | User biography |
| createdAt | DateTime | Account creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Relations:**
- One-to-many with Account, Session, Course (as instructor), Enrollment, Review, DiscussionPost, LectureProgress, QuizAttempt, Payment

#### Account
OAuth provider accounts linked to users.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String | Foreign key to User |
| type | String | Account type (oauth, email, etc.) |
| provider | String | OAuth provider name |
| providerAccountId | String | Provider's user ID |
| refresh_token | Text? | OAuth refresh token |
| access_token | Text? | OAuth access token |
| expires_at | Int? | Token expiration timestamp |
| token_type | String? | Token type |
| scope | String? | OAuth scope |
| id_token | Text? | OpenID Connect ID token |
| session_state | String? | Session state |

**Unique Constraint:** [provider, providerAccountId]

#### Session
User session management for NextAuth.js.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| sessionToken | String | Unique session token |
| userId | String | Foreign key to User |
| expires | DateTime | Session expiration time |

---

### Course Structure

#### Category
Course categories for organization and filtering.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| name | String | Unique category name |
| slug | String | URL-friendly slug |
| description | Text? | Category description |
| image | String? | Category image URL |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

#### Course
Main course entity with SEO optimization.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| title | String | Course title |
| slug | String | Unique URL slug |
| description | Text | Full course description |
| shortDescription | Text? | Brief summary |
| thumbnail | String? | Course thumbnail URL |
| previewVideo | String? | Preview video URL |
| level | CourseLevel | BEGINNER, INTERMEDIATE, ADVANCED, ALL_LEVELS |
| status | CourseStatus | DRAFT, PUBLISHED, ARCHIVED |
| pricingType | PricingType | FREE, ONE_TIME, SUBSCRIPTION |
| price | Float | One-time purchase price |
| subscriptionPrice | Float? | Monthly subscription price |
| language | String | Course language (default: "en") |
| metaTitle | String? | SEO meta title |
| metaDescription | Text? | SEO meta description |
| metaKeywords | String? | SEO keywords |
| totalDuration | Int | Total duration in minutes |
| totalLectures | Int | Number of lectures |
| enrollmentCount | Int | Number of enrollments |
| averageRating | Float | Average rating (0-5) |
| instructorId | String | Foreign key to User |
| categoryId | String | Foreign key to Category |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |
| publishedAt | DateTime? | Publication timestamp |

**Indexes:** instructorId, categoryId, status, slug

#### Section
Course sections/modules for organizing lectures.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| title | String | Section title |
| description | Text? | Section description |
| order | Int | Display order |
| courseId | String | Foreign key to Course |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

#### Lecture
Individual course lectures (video, PDF, article, or quiz).

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| title | String | Lecture title |
| description | Text? | Lecture description |
| type | LectureType | VIDEO, PDF, ARTICLE, QUIZ |
| order | Int | Display order within section |
| duration | Int? | Duration in minutes |
| videoUrl | String? | Video file URL |
| videoProvider | String? | Video hosting provider |
| videoId | String? | Unique video ID for secure access |
| pdfUrl | String? | PDF file URL |
| content | Text? | Article content (HTML/Markdown) |
| quizId | String? | Foreign key to Quiz |
| isFree | Boolean | Preview lecture flag |
| isPublished | Boolean | Publication status |
| sectionId | String | Foreign key to Section |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

---

### Quiz System

#### Quiz
Quiz configuration and settings.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| title | String | Quiz title |
| description | Text? | Quiz description |
| passingScore | Int | Passing percentage (default: 70) |
| timeLimit | Int? | Time limit in minutes (null = unlimited) |
| maxAttempts | Int? | Maximum attempts (null = unlimited) |
| shuffleQuestions | Boolean | Randomize question order |
| showCorrectAnswers | Boolean | Show correct answers after attempt |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

#### QuizQuestion
Individual quiz questions.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| question | Text | Question text |
| type | QuestionType | MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER |
| points | Int | Points for correct answer |
| explanation | Text? | Answer explanation |
| order | Int | Display order |
| quizId | String | Foreign key to Quiz |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

#### QuizOption
Answer options for multiple-choice questions.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| text | String | Option text |
| isCorrect | Boolean | Correct answer flag |
| order | Int | Display order |
| questionId | String | Foreign key to QuizQuestion |

#### QuizAttempt
Student quiz attempts.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| score | Float | Score percentage |
| passed | Boolean | Pass/fail status |
| startedAt | DateTime | Start timestamp |
| completedAt | DateTime? | Completion timestamp |
| userId | String | Foreign key to User |
| quizId | String | Foreign key to Quiz |

#### QuizAnswer
Individual answers within an attempt.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| answer | Text | Student's answer |
| isCorrect | Boolean | Correctness flag |
| pointsEarned | Int | Points earned |
| attemptId | String | Foreign key to QuizAttempt |
| questionId | String | Foreign key to QuizQuestion |
| createdAt | DateTime | Creation timestamp |

---

### Progress Tracking

#### Enrollment
Student course enrollments.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String | Foreign key to User |
| courseId | String | Foreign key to Course |
| enrolledAt | DateTime | Enrollment timestamp |
| completedAt | DateTime? | Completion timestamp |
| progress | Float | Progress percentage (0-100) |
| lastAccessedAt | DateTime | Last access timestamp |

**Unique Constraint:** [userId, courseId]

#### LectureProgress
Per-lecture progress tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String | Foreign key to User |
| lectureId | String | Foreign key to Lecture |
| isCompleted | Boolean | Completion status |
| watchedDuration | Int | Watched duration in seconds |
| completedAt | DateTime? | Completion timestamp |
| lastWatchedAt | DateTime | Last watch timestamp |

**Unique Constraint:** [userId, lectureId]

#### DripSchedule
Content scheduling rules for drip content.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| courseId | String | Foreign key to Course |
| lectureId | String | Foreign key to Lecture |
| daysAfterEnrollment | Int | Days to wait after enrollment |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Unique Constraint:** [courseId, lectureId]

---

### Social Features

#### Review
Course reviews and ratings.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| rating | Int | Rating (1-5) |
| comment | Text? | Review text |
| userId | String | Foreign key to User |
| courseId | String | Foreign key to Course |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Unique Constraint:** [userId, courseId]

#### Discussion
Course discussion boards.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| title | String | Discussion title |
| courseId | String | Foreign key to Course |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

#### DiscussionPost
Forum posts and replies.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| content | Text | Post content |
| userId | String | Foreign key to User |
| discussionId | String | Foreign key to Discussion |
| parentId | String? | Foreign key to parent post (for replies) |
| isPinned | Boolean | Pinned status |
| isModerated | Boolean | Moderation flag |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

---

### Payments

#### Payment
Payment transaction records.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| amount | Float | Payment amount |
| currency | String | Currency code (default: "usd") |
| status | PaymentStatus | PENDING, COMPLETED, FAILED, REFUNDED |
| type | PaymentType | ONE_TIME, SUBSCRIPTION |
| stripePaymentId | String? | Stripe payment intent ID |
| stripeSessionId | String? | Stripe checkout session ID |
| userId | String | Foreign key to User |
| courseId | String? | Foreign key to Course |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Indexes:** userId, stripePaymentId

---

## Enums

### UserRole
- STUDENT
- INSTRUCTOR
- ADMIN

### CourseLevel
- BEGINNER
- INTERMEDIATE
- ADVANCED
- ALL_LEVELS

### CourseStatus
- DRAFT
- PUBLISHED
- ARCHIVED

### PricingType
- FREE
- ONE_TIME
- SUBSCRIPTION

### LectureType
- VIDEO
- PDF
- ARTICLE
- QUIZ

### QuestionType
- MULTIPLE_CHOICE
- TRUE_FALSE
- SHORT_ANSWER

### PaymentStatus
- PENDING
- COMPLETED
- FAILED
- REFUNDED

### PaymentType
- ONE_TIME
- SUBSCRIPTION

---

## Key Relationships

### Course Hierarchy
```
Course
└── Section[]
    └── Lecture[]
        └── Quiz?
            └── QuizQuestion[]
                └── QuizOption[]
```

### User Interactions
```
User (Student)
├── Enrollment[]
│   └── Course
├── LectureProgress[]
│   └── Lecture
├── QuizAttempt[]
│   └── Quiz
├── Review[]
│   └── Course
└── DiscussionPost[]
    └── Discussion

User (Instructor)
└── Course[] (as instructor)
```

### Payment Flow
```
User → Payment → Stripe → Webhook → Enrollment → Course Access
```

---

## Indexes and Performance

### Recommended Indexes
- User: email (unique)
- Course: slug (unique), instructorId, categoryId, status
- Enrollment: [userId, courseId] (unique composite)
- LectureProgress: [userId, lectureId] (unique composite)
- Review: [userId, courseId] (unique composite)
- DripSchedule: [courseId, lectureId] (unique composite)
- Payment: userId, stripePaymentId

### Query Optimization Tips
1. Use `include` selectively to avoid over-fetching
2. Implement pagination for large lists
3. Cache frequently accessed data (categories, popular courses)
4. Use database indexes for common query patterns
5. Consider read replicas for high-traffic deployments

---

## Migration Strategy

### Initial Setup
```bash
npx prisma migrate dev --name init
```

### Adding New Fields
```bash
npx prisma migrate dev --name add_field_name
```

### Production Migrations
```bash
npx prisma migrate deploy
```

---

## Data Integrity

### Cascade Deletes
When a course is deleted, the following are also deleted:
- All sections
- All lectures
- All enrollments
- All reviews
- All discussions and posts

### Soft Deletes (Future Enhancement)
Consider implementing soft deletes for:
- Courses (allow instructors to archive instead of delete)
- User accounts (maintain referential integrity)

---

## Security Considerations

1. **Password Storage**: Always hashed with bcrypt
2. **API Access**: Validated through NextAuth.js sessions
3. **SQL Injection**: Protected by Prisma's parameterized queries
4. **Row-Level Security**: Implemented in API routes, not database
5. **PII Protection**: Email and password should be handled securely

---

## Backup and Recovery

### Recommended Backup Strategy
1. Daily automated backups
2. Point-in-time recovery enabled
3. Test restore procedures monthly
4. Store backups in separate region
5. Encrypt backups at rest

### Data Retention
- User data: Indefinite (unless user requests deletion)
- Payment records: 7 years (for tax/legal compliance)
- Analytics data: 2 years
- Logs: 90 days
