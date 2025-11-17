# Vacation Rental Platform

A full-stack vacation rental platform similar to Airbnb, built with Next.js 14, TypeScript, and modern web technologies.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC)

## Features

### For Guests
- 🔍 **Property Search** - Search properties by location, dates, guests, and filters
- 🗺️ **Interactive Map** - Browse properties on an interactive Mapbox map
- 📅 **Smart Booking** - Date picker with real-time availability and price calculation
- ❤️ **Wishlist** - Save favorite properties for later
- ⭐ **Reviews & Ratings** - Read and write detailed reviews with ratings
- 💳 **Secure Payments** - Stripe integration for safe transactions
- 📱 **Responsive Design** - Optimized for all devices

### For Hosts
- 🏠 **Property Management** - List and manage multiple properties
- 💰 **Pricing Control** - Set base prices, cleaning fees, and custom pricing
- 📊 **Dashboard** - Track bookings, earnings, and performance
- 📸 **Image Upload** - Upload property photos to cloud storage
- 📅 **Calendar Management** - Manage availability and blocked dates
- 📈 **Analytics** - View booking statistics and earnings

### For Admins
- 🛡️ **Platform Moderation** - Review and moderate properties and users
- 📊 **System Analytics** - Monitor platform performance
- 👥 **User Management** - Manage user accounts and roles

### Technical Features
- 🔐 **Authentication** - NextAuth.js with Google OAuth and Email login
- 🎨 **Modern UI** - TailwindCSS with Radix UI components
- 📦 **Type Safety** - Full TypeScript coverage
- 🗄️ **Database** - Prisma ORM with PostgreSQL
- 🖼️ **Image Storage** - Cloudflare R2 or AWS S3 with presigned URLs
- 💳 **Payments** - Stripe with webhooks for bookings and refunds
- 🚀 **SEO Optimized** - Next.js metadata and sitemap generation
- 🐳 **Docker Ready** - Production-ready Docker configuration
- 📱 **PWA Ready** - Progressive Web App capabilities

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + Radix UI
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Auth.js v5)
- **Payments**: Stripe
- **Image Storage**: Cloudflare R2 / AWS S3
- **Maps**: Mapbox GL JS
- **Deployment**: Docker, Vercel, Railway

## Project Structure

```
vacation-rental-platform/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seeding
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/           # API routes
│   │   ├── auth/          # Authentication pages
│   │   ├── host/          # Host dashboard
│   │   ├── properties/    # Property pages
│   │   └── layout.tsx     # Root layout
│   ├── components/         # React components
│   │   ├── ui/            # UI components
│   │   ├── navbar.tsx     # Navigation
│   │   └── footer.tsx     # Footer
│   ├── lib/               # Utilities
│   │   ├── prisma.ts      # Prisma client
│   │   ├── stripe.ts      # Stripe client
│   │   ├── s3.ts          # S3/R2 client
│   │   └── utils.ts       # Helper functions
│   └── types/             # TypeScript types
├── public/                 # Static assets
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose
├── next.config.js         # Next.js config
├── tailwind.config.ts     # Tailwind config
└── package.json           # Dependencies

```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn
- Git

### Installation

1. **Clone the repository**

```bash
git clone <your-repository-url>
cd vacation-rental-platform
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vacation_rental"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"  # Generate: openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Cloudflare R2 or AWS S3
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="vacation-rentals"
R2_PUBLIC_URL="https://your-bucket.r2.dev"

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN="your-mapbox-token"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Set up the database**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database (optional)
npm run prisma:seed
```

5. **Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The platform uses a comprehensive PostgreSQL schema with the following main models:

- **User** - User accounts with roles (Guest, Host, Admin)
- **Property** - Property listings with details, pricing, and amenities
- **Booking** - Booking records with status tracking
- **Payment** - Payment transactions via Stripe
- **Review** - Property reviews and ratings
- **Wishlist** - User favorite properties
- **BlockedDate** - Property unavailable dates
- **CustomPricing** - Seasonal/custom pricing rules
- **Notification** - User notifications

See `prisma/schema.prisma` for the complete schema.

## API Routes

### Authentication
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get session

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List user bookings
- `GET /api/bookings/[id]` - Get booking details
- `PATCH /api/bookings/[id]/cancel` - Cancel booking

### Properties
- `GET /api/properties` - List properties
- `POST /api/properties` - Create property (host)
- `GET /api/properties/[id]` - Get property details
- `PATCH /api/properties/[id]` - Update property (host)
- `DELETE /api/properties/[id]` - Delete property (host)

### Uploads
- `POST /api/upload` - Get presigned upload URL

### Payments
- `POST /api/stripe/webhook` - Stripe webhook handler

## Development

### Running Tests

```bash
npm run test
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Database Management

```bash
# Open Prisma Studio
npm run prisma:studio

# Create a migration
npx prisma migrate dev --name your_migration_name

# Reset database
npx prisma migrate reset
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:
- Vercel
- Railway
- Docker
- Manual VPS deployment

### Quick Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### Stripe Setup

1. Create account at [Stripe](https://stripe.com)
2. Get API keys from Dashboard
3. Set up webhook endpoint: `your-domain.com/api/stripe/webhook`
4. Add webhook secret to environment variables

### Cloudflare R2 Setup

1. Create R2 bucket in Cloudflare dashboard
2. Generate API tokens
3. Configure CORS for browser uploads
4. Add public access domain

### Mapbox Setup

1. Create account at [Mapbox](https://mapbox.com)
2. Get access token
3. Add to environment variables

## Features to Implement

The platform includes core functionality. Consider adding:

- [ ] Real-time messaging between guests and hosts
- [ ] Advanced search filters (price range, amenities)
- [ ] Multi-currency support
- [ ] Calendar synchronization (iCal)
- [ ] Host payout management
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Property verification system
- [ ] Insurance integration
- [ ] Multi-language support
- [ ] Mobile app (React Native)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- All passwords are hashed with bcrypt
- CSRF protection enabled
- SQL injection prevention via Prisma
- XSS protection with proper sanitization
- Stripe webhook signature verification
- Environment variables for sensitive data

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@vacationrentals.com or open an issue on GitHub.

## Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting solutions
- Stripe for payment processing
- Mapbox for mapping services
- Prisma for the excellent ORM

---

Built with ❤️ using Next.js 14 and TypeScript
