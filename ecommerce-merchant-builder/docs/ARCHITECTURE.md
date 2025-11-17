# Architecture Documentation

## System Overview

The E-Commerce Merchant Builder is a multi-tenant SaaS platform that enables merchants to create and manage their online stores. The system is built using modern web technologies with a focus on scalability, security, and developer experience.

## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router for server-side rendering
- **TypeScript**: Type-safe JavaScript for better developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Icon library

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **NextAuth.js**: Authentication and session management
- **Prisma**: Type-safe ORM for database operations

### Database
- **PostgreSQL**: Relational database for data persistence
- **Prisma Schema**: Database schema definition and migrations

### External Services
- **Stripe**: Payment processing and checkout
- **S3/Cloudflare R2**: Object storage for images
- **Email Service**: (To be implemented) Order notifications

## Architecture Patterns

### 1. Multi-Tenant Architecture

Each merchant operates an isolated store with:
- Unique domain/subdomain (e.g., `techhub`, `stylemart`)
- Separate product catalog
- Independent branding and customization
- Isolated order management

**Data Isolation Strategy:**
- All data is partitioned by `storeId`
- Row-level security through Prisma queries
- API endpoints validate store ownership

### 2. Role-Based Access Control (RBAC)

Three distinct user roles:

**Admin:**
- Platform-wide monitoring
- Merchant management
- Revenue analytics
- System configuration

**Merchant:**
- Store management
- Product CRUD operations
- Order processing
- Analytics dashboard
- Discount management

**Buyer:**
- Product browsing
- Order placement
- Order tracking
- Profile management

### 3. API Architecture

**RESTful Design:**
- Resource-based URLs (`/api/products`, `/api/orders`)
- Standard HTTP methods (GET, POST, PATCH, DELETE)
- Consistent response format
- Proper status codes

**Middleware Chain:**
```
Request → Authentication → Authorization → Handler → Response
```

### 4. Data Layer

**Prisma ORM Benefits:**
- Type-safe database queries
- Automatic migrations
- Query builder with IntelliSense
- Connection pooling
- Transaction support

**Database Schema Design:**
- Normalized data structure
- Foreign key constraints
- Indexes on frequently queried fields
- JSON fields for flexible data (variants, metadata)

## System Components

### Authentication Flow

```
1. User Registration
   ↓
2. Password Hashing (bcrypt)
   ↓
3. User Creation in Database
   ↓
4. Email Verification (Optional)

Login Flow:
1. Credentials Input
   ↓
2. NextAuth.js Validation
   ↓
3. JWT Token Generation
   ↓
4. Session Creation
   ↓
5. Cookie Storage
```

### Product Discovery Flow

```
1. User visits storefront
   ↓
2. Next.js SSR fetches products
   ↓
3. Cache check (revalidate: 3600s)
   ↓
4. Database query with filters
   ↓
5. Render product grid
   ↓
6. SEO metadata injection
```

### Order Processing Flow

```
1. Cart checkout
   ↓
2. Order creation (PENDING)
   ↓
3. Stripe checkout session
   ↓
4. Customer payment
   ↓
5. Webhook: order.paid
   ↓
6. Update order status (PAID)
   ↓
7. Inventory adjustment
   ↓
8. Email notification
   ↓
9. Merchant fulfillment
```

### Image Upload Flow

```
1. File selection (max 5MB)
   ↓
2. Client-side validation
   ↓
3. Upload to /api/upload
   ↓
4. Server-side validation
   ↓
5. S3/R2 upload
   ↓
6. Return public URL
   ↓
7. Store URL in database
```

## Security Considerations

### 1. Authentication & Authorization
- JWT-based sessions via NextAuth.js
- HTTPOnly cookies for session storage
- CSRF protection built into Next.js
- Password hashing with bcrypt (10 rounds)

### 2. Data Protection
- SQL injection prevention via Prisma
- XSS protection via React's escaping
- Input validation with Zod schemas
- Environment variable protection

### 3. Payment Security
- PCI compliance via Stripe
- No credit card storage on server
- Webhook signature verification
- Secure checkout session creation

### 4. API Security
- Authentication middleware on protected routes
- Role-based authorization checks
- Rate limiting (recommended for production)
- Request validation

## Performance Optimizations

### 1. Server-Side Rendering (SSR)
- Fast initial page loads
- SEO-friendly content
- Dynamic data fetching

### 2. Static Generation
- Product pages cached (1 hour)
- Incremental Static Regeneration (ISR)
- CDN-friendly architecture

### 3. Database Optimization
- Indexed columns for fast queries
- Connection pooling
- Query optimization via Prisma
- Eager loading with `include`

### 4. Image Optimization
- Next.js Image component
- Lazy loading
- WebP format support
- Responsive images

### 5. Code Splitting
- Automatic route-based splitting
- Dynamic imports for heavy components
- Tree shaking for smaller bundles

## Scalability Strategy

### Horizontal Scaling
- Stateless API design
- Database connection pooling
- External session storage
- Load balancer ready

### Database Scaling
- Read replicas for read-heavy operations
- Partitioning by storeId
- Caching layer (Redis recommended)
- Query optimization

### File Storage
- S3/R2 for unlimited storage
- CDN for fast delivery
- Separate image processing service

## Monitoring & Observability

### Logging
- API request/response logging
- Error tracking (Sentry recommended)
- Performance monitoring
- User activity logs

### Metrics
- Order conversion rates
- API response times
- Database query performance
- Error rates

### Alerts
- Payment failures
- System errors
- Performance degradation
- Security incidents

## Deployment Architecture

### Development
```
Developer → Git → Local Docker
```

### Staging
```
Git Push → CI/CD → Staging Server → Manual Testing
```

### Production
```
Git Tag → CI/CD → Build → Deploy → Health Check → Production
```

### Infrastructure Options

**Option 1: Vercel (Recommended)**
- One-click deployment
- Automatic scaling
- Global CDN
- Serverless functions
- Database integration

**Option 2: Docker + Kubernetes**
- Full control over infrastructure
- Custom scaling rules
- Multi-region deployment
- Cost optimization

**Option 3: Traditional VPS**
- PM2 process manager
- Nginx reverse proxy
- PostgreSQL server
- Manual scaling

## Data Flow Diagrams

### Product Creation Flow
```
Merchant Dashboard
      ↓
   Form Submit
      ↓
POST /api/products
      ↓
  Validation (Zod)
      ↓
Store Ownership Check
      ↓
  Image URLs Validation
      ↓
  Prisma Create
      ↓
  Database Insert
      ↓
   Return Product
      ↓
  Update UI
```

### Checkout Flow
```
Customer Cart
      ↓
Create Order (PENDING)
      ↓
POST /api/checkout
      ↓
Create Stripe Session
      ↓
Redirect to Stripe
      ↓
Customer Pays
      ↓
Stripe Webhook
      ↓
Update Order (PAID)
      ↓
Send Confirmation Email
      ↓
Update Inventory
```

## Future Enhancements

### Phase 2
- Shopping cart persistence
- Email notifications
- Product reviews
- Advanced analytics
- Multi-currency support

### Phase 3
- Mobile apps (React Native)
- GraphQL API
- Real-time notifications
- AI-powered recommendations
- Inventory management

### Phase 4
- Marketplace features
- Affiliate program
- Drop shipping integration
- Advanced SEO tools
- Custom themes marketplace

## Development Guidelines

### Code Organization
- Feature-based folder structure
- Shared components in `/components/ui`
- API routes in `/app/api`
- Utilities in `/lib`

### Naming Conventions
- PascalCase for components
- camelCase for functions/variables
- UPPER_CASE for constants
- kebab-case for files

### Testing Strategy
- Unit tests for utilities
- Integration tests for API routes
- E2E tests for critical flows
- Visual regression testing

### Git Workflow
- Feature branches
- Pull request reviews
- Conventional commits
- Semantic versioning

## Troubleshooting Guide

### Common Issues

**Database Connection Failed:**
- Check DATABASE_URL in .env
- Verify PostgreSQL is running
- Check network/firewall settings

**Stripe Webhook Not Working:**
- Verify STRIPE_WEBHOOK_SECRET
- Check webhook endpoint URL
- Test with Stripe CLI

**Image Upload Fails:**
- Verify S3 credentials
- Check bucket permissions
- Validate file size/type

**Build Errors:**
- Clear .next folder
- Delete node_modules and reinstall
- Check TypeScript errors
- Verify environment variables

## Support & Resources

- **Documentation**: See [README.md](../README.md)
- **API Reference**: See [API.md](./API.md)
- **Community**: GitHub Discussions
- **Issues**: GitHub Issues

---

Last updated: 2024
