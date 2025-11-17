# System Architecture

This document describes the architecture of the Vacation Rental Platform.

## Overview

The platform is built as a monolithic Next.js application using the App Router, with a PostgreSQL database and external services for payments, storage, and mapping.

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│         Next.js Application             │
│  ┌──────────────────────────────────┐  │
│  │      App Router (SSR/SSG)        │  │
│  │  ┌───────────┐  ┌─────────────┐ │  │
│  │  │  Pages    │  │  API Routes │ │  │
│  │  └───────────┘  └─────────────┘ │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │      Server Components           │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │      Client Components           │  │
│  └──────────────────────────────────┘  │
└────────┬──────────┬──────────┬─────────┘
         │          │          │
         ▼          ▼          ▼
┌────────────┐ ┌─────────┐ ┌───────────┐
│ PostgreSQL │ │ Stripe  │ │ R2/S3     │
│  Database  │ │ Payment │ │  Storage  │
└────────────┘ └─────────┘ └───────────┘
         │
         ▼
┌────────────────┐
│ Prisma ORM     │
└────────────────┘
```

## Application Layers

### 1. Presentation Layer (Frontend)

#### Server Components (Default)
- **Benefits**: Better SEO, faster initial load, reduced JS bundle
- **Usage**: Page layouts, property listings, property details
- **Data Fetching**: Direct database queries via Prisma

```typescript
// Example: Property detail page (Server Component)
export default async function PropertyPage({ params }) {
  const property = await prisma.property.findUnique({
    where: { id: params.id }
  })
  return <PropertyDetail property={property} />
}
```

#### Client Components
- **Benefits**: Interactivity, state management, browser APIs
- **Usage**: Forms, modals, interactive maps, booking calendar
- **Marked with**: `'use client'` directive

```typescript
// Example: Booking form (Client Component)
'use client'
export function BookingForm() {
  const [date, setDate] = useState(null)
  // ... interactive logic
}
```

### 2. API Layer

#### Route Handlers (App Router)
Located in `src/app/api/`:
- `auth/` - Authentication endpoints
- `bookings/` - Booking management
- `properties/` - Property CRUD
- `upload/` - File upload URLs
- `stripe/webhook/` - Payment webhooks

```typescript
// Example: API route
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return unauthorized()

  const data = await request.json()
  const result = await prisma.booking.create({ data })
  return NextResponse.json(result)
}
```

### 3. Business Logic Layer

#### Utility Functions (`src/lib/`)
- **utils.ts**: Helper functions (pricing, dates, formatting)
- **auth.ts**: Authentication helpers
- **stripe.ts**: Payment processing
- **s3.ts**: File upload/download

```typescript
// Example: Price calculation
export function calculateTotalPrice(
  pricePerNight: number,
  nights: number,
  cleaningFee: number,
  serviceFeePercentage: number
) {
  const subtotal = pricePerNight * nights
  const serviceFee = subtotal * (serviceFeePercentage / 100)
  return {
    subtotal,
    cleaningFee,
    serviceFee,
    total: subtotal + cleaningFee + serviceFee
  }
}
```

### 4. Data Access Layer

#### Prisma ORM
- **Schema**: `prisma/schema.prisma`
- **Client**: Generated TypeScript types
- **Migrations**: Version-controlled schema changes

```prisma
model Booking {
  id          String   @id @default(cuid())
  guestId     String
  propertyId  String
  checkIn     DateTime
  checkOut    DateTime
  totalPrice  Decimal
  status      BookingStatus
  // ... relations
}
```

## Data Flow

### 1. Guest Booking Flow

```
User Action → Client Component → API Route → Validation →
Prisma Query → Database → Create Booking → Stripe Payment →
Webhook → Update Status → Notification
```

#### Detailed Steps:
1. Guest selects dates in BookingCard (client component)
2. Component calculates price client-side for preview
3. "Reserve" button triggers API call to `/api/bookings`
4. API validates:
   - User authentication
   - Date availability
   - Guest capacity
   - Min/max nights
5. Creates pending booking in database
6. Redirects to Stripe checkout
7. Payment success triggers webhook
8. Webhook updates booking status to CONFIRMED
9. Creates payment record
10. Sends notification to host and guest

### 2. Host Property Creation Flow

```
Form Submission → Image Upload (presigned URL) →
API Validation → Database Insert → Return Property
```

#### Detailed Steps:
1. Host fills property form
2. Images uploaded directly to R2/S3 via presigned URLs
3. Form submission with image URLs
4. API validates all fields
5. Creates property in database (status: DRAFT)
6. Host can preview and activate

### 3. Search and Filter Flow

```
User Input → Query Parameters → Server Component →
Prisma Query (with filters) → Render Results
```

#### Search Capabilities:
- Location-based (city, state, country)
- Date-based availability checking
- Guest capacity filtering
- Price range filtering
- Category filtering
- Amenity filtering

## Database Design

### Core Entities

#### User
- Stores authentication data
- Links to NextAuth tables (Account, Session)
- Role-based (GUEST, HOST, ADMIN)

#### Property
- Complete property information
- Soft delete (status field)
- Geolocation (lat/long for maps)
- JSON array for amenities and images

#### Booking
- Immutable once confirmed
- Links property and guest
- Stores pricing snapshot
- Status tracking for lifecycle

#### Payment
- Records all payment attempts
- Links to Stripe IDs
- Supports refunds

### Relationships

```
User (1) ─────── (N) Property
                     │
                     │ (1)
                     │
User (1) ─────── (N) Booking
                     │
                     │ (1)
                     │
                     └─────── (N) Payment

User (1) ─────── (N) Review ─────── (1) Property

User (1) ─────── (N) Wishlist ─────── (1) Property
```

## Authentication Flow

### NextAuth.js v5 (Auth.js)

```
1. User clicks "Sign in with Google"
   ↓
2. Redirects to Google OAuth
   ↓
3. User authorizes
   ↓
4. Google redirects to callback URL
   ↓
5. NextAuth creates/updates user
   ↓
6. Creates session in database
   ↓
7. Sets session cookie
   ↓
8. Redirects to home page
```

### Session Management
- Database sessions (not JWT)
- Secure HTTP-only cookies
- Session validation on each request via middleware

## Payment Processing

### Stripe Integration

```
Booking Creation
    ↓
Create Payment Intent (Stripe)
    ↓
Client-side Stripe Elements
    ↓
Payment Confirmation
    ↓
Webhook Event (async)
    ↓
Update Booking Status
    ↓
Create Payment Record
```

### Supported Operations:
- **Payments**: One-time charges for bookings
- **Refunds**: Full or partial refunds
- **Webhooks**:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `charge.refunded`

## File Storage

### Cloudflare R2 / AWS S3

```
1. Client requests upload URL
   ↓
2. Server generates presigned URL (expires in 1h)
   ↓
3. Client uploads directly to R2/S3
   ↓
4. Client receives file URL
   ↓
5. URL saved with property/user record
```

### Benefits:
- No file passing through server
- Reduced bandwidth costs
- Faster uploads
- Scalable storage

## Caching Strategy

### Next.js Built-in Caching

1. **Server Components**: Cached by default
2. **Route Handlers**: No cache by default
3. **Database Queries**: Use `cache()` function for deduplication

```typescript
// Revalidate every hour
export const revalidate = 3600

// Or dynamic route
export const dynamic = 'force-dynamic'
```

### Recommended Additions:
- Redis for session storage (high-traffic apps)
- CDN for static assets and images
- Query result caching for expensive operations

## Security

### Application Security

1. **Authentication**
   - Secure session cookies
   - OAuth 2.0 for Google
   - Magic links for email

2. **Authorization**
   - Role-based access control
   - Route protection via middleware
   - API route guards

3. **Data Protection**
   - SQL injection prevention (Prisma)
   - XSS protection (React escaping)
   - CSRF protection (built-in)

4. **Payment Security**
   - PCI compliance via Stripe
   - Webhook signature verification
   - No card data stored locally

### Environment Variables
All sensitive data in environment variables:
- Database credentials
- API keys
- OAuth secrets
- Webhook secrets

## Scalability Considerations

### Current Architecture (Monolith)
- Simple deployment
- Suitable for small to medium scale
- Vertical scaling initially

### Scaling Path

1. **Database Optimization**
   - Connection pooling (PgBouncer)
   - Read replicas
   - Indexed queries

2. **Application Scaling**
   - Multiple instances behind load balancer
   - CDN for static assets
   - Edge caching (Vercel/Cloudflare)

3. **Microservices Migration** (if needed)
   - Booking service
   - Payment service
   - Notification service
   - Search service (Elasticsearch)

4. **Infrastructure**
   - Container orchestration (Kubernetes)
   - Managed services (AWS RDS, Redis)
   - Message queue (RabbitMQ, AWS SQS)

## Monitoring & Observability

### Recommended Tools

1. **Application Monitoring**
   - Vercel Analytics (built-in)
   - Sentry for error tracking
   - LogRocket for session replay

2. **Database Monitoring**
   - Prisma query logging
   - PostgreSQL slow query log
   - Database metrics (connections, query time)

3. **Performance**
   - Next.js built-in metrics
   - Core Web Vitals
   - API response times

### Logging Strategy

```typescript
// Structured logging
console.log({
  level: 'info',
  message: 'Booking created',
  bookingId: booking.id,
  userId: user.id,
  timestamp: new Date().toISOString()
})
```

## Deployment Architecture

### Production Setup

```
┌─────────────┐
│   Vercel    │ (Application)
└──────┬──────┘
       │
       ├────────────────┐
       │                │
       ▼                ▼
┌──────────────┐  ┌──────────┐
│   Railway    │  │  Stripe  │
│ (PostgreSQL) │  │ (Payment)│
└──────────────┘  └──────────┘
       │
       ▼
┌──────────────┐
│ Cloudflare R2│
│   (Images)   │
└──────────────┘
```

### Benefits:
- **Vercel**: Automatic scaling, edge network, zero-config
- **Railway**: Managed PostgreSQL, automatic backups
- **R2**: Cost-effective storage, no egress fees
- **Stripe**: PCI compliance, fraud detection

## Development Workflow

```
Local Development → Git Commit → Push to GitHub →
CI/CD Pipeline → Run Tests → Build → Deploy to Staging →
Manual Review → Deploy to Production
```

### Local Development:
1. PostgreSQL via Docker
2. Hot reload with Next.js
3. Prisma Studio for database management
4. Stripe CLI for webhook testing

## Future Enhancements

### Technical Improvements
- [ ] Implement Redis caching
- [ ] Add full-text search (Elasticsearch)
- [ ] Implement rate limiting
- [ ] Add API versioning
- [ ] GraphQL API option
- [ ] WebSocket for real-time features
- [ ] Service worker for offline support
- [ ] Implement event sourcing for bookings

### Feature Additions
- [ ] Real-time messaging
- [ ] Video tours
- [ ] AI-powered recommendations
- [ ] Dynamic pricing algorithms
- [ ] Loyalty program
- [ ] Referral system

---

This architecture is designed to be simple to start with, yet scalable as the platform grows. The monolithic approach reduces complexity initially, while the modular code structure allows for future service extraction if needed.
