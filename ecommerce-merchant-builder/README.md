# E-Commerce Merchant Builder

A full-stack e-commerce platform builder like Shopify, built with Next.js 14, TypeScript, PostgreSQL, and Stripe.

## Features

### Core Platform Features

- **Multi-Tenant Architecture**: Each merchant gets their own store with custom domain
- **Role-Based Access Control**: Three user roles - Admin, Merchant, and Buyer
- **Storefront Theme Engine**: Customizable store themes with page templates
- **SEO Optimized**: Product pages with metadata, OpenGraph, and JSON-LD structured data
- **Server-Side Rendering**: Fast page loads with Next.js 14 SSR
- **Caching Strategy**: Product pages cached for 1 hour for optimal performance

### Merchant Features

- **Store Management**: Create and customize your online store
  - Custom domain support
  - Brand colors and logo
  - Custom CSS injection
- **Product Management**: Full CRUD operations for products
  - Multiple images per product
  - Inventory tracking
  - Product variants
  - SKU and barcode support
  - SEO metadata per product
- **Category Management**: Organize products with hierarchical categories
- **Discount Management**: Create discount codes
  - Percentage or fixed amount discounts
  - Minimum purchase requirements
  - Usage limits and date ranges
- **Order Management**: Track and manage customer orders
- **Analytics Dashboard**: View sales metrics and store performance

### Buyer Features

- **Product Discovery**: Browse products with search and filters
- **Checkout**: Secure checkout with Stripe
- **Order Tracking**: Track order status and history

### Admin Features

- **Platform Monitoring**: Monitor all merchants and stores
- **Revenue Analytics**: Track platform-wide revenue
- **User Management**: Manage merchants and buyers

### Technical Features

- **Image Uploads**: S3/Cloudflare R2 integration for image storage
- **Payment Processing**: Stripe integration for secure payments
- **Webhooks**: Order event webhooks for integrations
- **Global Search**: Full-text search across products
- **Pagination**: Efficient data loading with pagination
- **Type Safety**: Full TypeScript coverage
- **Database**: PostgreSQL with Prisma ORM

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Payment**: Stripe
- **Image Storage**: S3-compatible (AWS S3 / Cloudflare R2)
- **Deployment**: Vercel, Docker, or any Node.js hosting

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn
- Stripe account (for payments)
- S3-compatible storage (AWS S3 or Cloudflare R2)

## Installation

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-merchant-builder
   ```

2. **Run the setup script**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

### Manual Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in your credentials:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce_db"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."

   # S3/Cloudflare R2
   S3_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
   S3_REGION="auto"
   S3_ACCESS_KEY_ID="your-access-key"
   S3_SECRET_ACCESS_KEY="your-secret-key"
   S3_BUCKET_NAME="ecommerce-uploads"
   NEXT_PUBLIC_S3_URL="https://pub-xxxxx.r2.dev"

   # App
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```

4. **Run database migrations**
   ```bash
   npm run db:push
   ```

5. **Seed the database (optional)**
   ```bash
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   ```
   http://localhost:3000
   ```

## Default Users (After Seeding)

- **Admin**: admin@example.com / admin123
- **Merchant 1**: merchant1@example.com / merchant123 (TechHub Electronics)
- **Merchant 2**: merchant2@example.com / merchant123 (StyleMart Fashion)
- **Buyer**: buyer@example.com / buyer123

## Project Structure

```
ecommerce-merchant-builder/
├── app/                          # Next.js 14 App Router
│   ├── (storefront)/            # Public storefront pages
│   │   └── [domain]/            # Dynamic store pages
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── products/            # Product CRUD
│   │   ├── stores/              # Store management
│   │   ├── categories/          # Category management
│   │   ├── discounts/           # Discount management
│   │   ├── orders/              # Order management
│   │   ├── checkout/            # Stripe checkout
│   │   ├── upload/              # Image upload
│   │   ├── webhooks/            # Stripe webhooks
│   │   └── admin/               # Admin endpoints
│   ├── auth/                    # Auth pages (signin, register)
│   └── dashboard/               # Dashboard pages
├── components/                  # React components
│   ├── ui/                      # Reusable UI components
│   ├── dashboard/               # Dashboard components
│   └── storefront/              # Storefront components
├── lib/                         # Utility libraries
│   ├── prisma.ts               # Prisma client
│   ├── auth.ts                 # NextAuth configuration
│   ├── stripe.ts               # Stripe utilities
│   ├── s3.ts                   # S3/R2 utilities
│   └── utils.ts                # Helper functions
├── prisma/                      # Prisma schema and migrations
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed data
├── scripts/                     # Deployment scripts
│   ├── setup.sh                # Development setup
│   └── deploy.sh               # Production deployment
└── types/                       # TypeScript type definitions
```

## Development

```bash
# Start development server
npm run dev

# Run Prisma Studio (database GUI)
npm run db:studio

# Generate Prisma Client
npm run db:generate

# Create a migration
npm run db:migrate

# Push schema to database
npm run db:push

# Seed database
npm run db:seed

# Build for production
npm run build

# Run linting
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy!

### Docker

```bash
# Build the image
docker build -t ecommerce-builder .

# Run the container
docker run -p 3000:3000 ecommerce-builder
```

### Traditional Hosting

```bash
# Run the deployment script
./scripts/deploy.sh

# Start the production server
npm run start
```

## License

MIT License

---

**Happy Building!** 🚀
