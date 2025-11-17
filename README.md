# Product Discovery Platform

A full-stack product discovery platform built with Next.js 14, similar to ProductHunt. Discover, share, and vote on amazing products.

## Features

- **Authentication & Authorization**
  - NextAuth.js with credential-based authentication
  - Role-based access control (User, Maker, Admin)
  - Secure password hashing with bcrypt

- **Product Management**
  - Post products with images, descriptions, and tags
  - Upload and manage product images
  - Rich product profiles with maker information
  - Category-based organization

- **Engagement System**
  - Upvote products (one vote per user)
  - Nested comment system with replies
  - Real-time vote and comment counts

- **Discovery Features**
  - Trending algorithm with time decay + engagement scoring
  - Daily leaderboard showing top products
  - Search functionality
  - Filter by categories and tags
  - Sort by trending, newest, or most voted

- **Admin Panel**
  - Product moderation (publish/unpublish)
  - Spam detection and prevention
  - Report management system
  - Featured products curation

- **Mobile-First Design**
  - Fully responsive UI
  - Tailwind CSS styling
  - Optimized for all screen sizes

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **Image Handling:** Sharp for optimization
- **Form Validation:** Zod
- **Date Utilities:** date-fns

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd product-discovery-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/product_discovery?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Upload settings
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./public/uploads
```

**Important:** Replace the database credentials with your PostgreSQL credentials.

### 4. Generate a secure NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET`.

### 5. Set up the database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The platform uses the following main models:

- **User** - User accounts with roles (USER, MAKER, ADMIN)
- **Product** - Products with details, images, and relationships
- **Category** - Product categories
- **Tag** - Product tags for better discoverability
- **Vote** - User votes on products
- **Comment** - Comments and replies on products
- **Report** - User reports for spam/abuse

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── products/      # Product CRUD operations
│   │   ├── admin/         # Admin moderation endpoints
│   │   └── ...
│   ├── products/          # Product pages
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin panel
│   ├── submit/            # Product submission
│   └── leaderboard/       # Daily leaderboard
├── components/            # React components
├── lib/                   # Utility functions and configurations
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Helper functions
├── prisma/                # Database schema and migrations
└── public/                # Static files
```

## Key Features Explained

### Trending Algorithm

The platform uses a time-decay algorithm to calculate trending scores:

```typescript
trendingScore = (votes * 10 + comments * 5) / (ageInHours + 2) ^ 1.8
```

This ensures newer products with high engagement appear in trending, while older products naturally decay.

### Spam Prevention

- Automatic spam flagging after 3+ user reports
- Admin moderation panel for manual review
- Published/unpublished status control
- Rate limiting on submissions (can be enhanced)

### Role-Based Access

- **USER**: Browse, vote, comment, report
- **MAKER**: All USER permissions + submit products
- **ADMIN**: All permissions + moderation tools

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out

### Products
- `GET /api/products` - List products (with filters)
- `POST /api/products` - Create product (Maker/Admin only)
- `GET /api/products/[id]` - Get product details
- `PATCH /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Voting
- `POST /api/products/[id]/vote` - Toggle vote
- `GET /api/products/[id]/vote` - Check vote status

### Comments
- `GET /api/products/[id]/comments` - Get comments
- `POST /api/products/[id]/comments` - Add comment

### Admin
- `GET /api/admin/products` - List all products
- `PATCH /api/admin/products/[id]` - Moderate product
- `GET /api/admin/reports` - View reports
- `PATCH /api/admin/reports/[id]` - Resolve report

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Railway
- Render
- DigitalOcean
- AWS, GCP, Azure

**Database Requirements:**
- Ensure your PostgreSQL database is accessible
- Update `DATABASE_URL` with production credentials
- Run migrations: `npx prisma migrate deploy`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | Yes |
| NEXTAUTH_SECRET | Secret for NextAuth.js | Yes |
| NEXTAUTH_URL | App URL (e.g., https://yourdomain.com) | Yes |
| MAX_FILE_SIZE | Max upload size in bytes (default: 5MB) | No |
| UPLOAD_DIR | Upload directory path | No |

## Development

### Running Tests

```bash
npm run test
```

### Linting

```bash
npm run lint
```

### Database Management

```bash
# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset

# Create migration
npx prisma migrate dev --name migration_name
```

## Default Credentials (After Seeding)

- **Admin**: admin@example.com / admin123
- **Maker**: maker@example.com / maker123
- **User**: user@example.com / user123

**Important:** Change these passwords in production!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Security Considerations

- All passwords are hashed with bcrypt
- CSRF protection via NextAuth
- SQL injection prevention via Prisma
- XSS protection via React
- File upload validation (type and size)
- Rate limiting recommended for production

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please open an issue on GitHub.

## Roadmap

- [ ] Email verification
- [ ] Social auth (Google, GitHub)
- [ ] Product collections/favorites
- [ ] Maker profiles and portfolios
- [ ] Newsletter subscription
- [ ] API rate limiting
- [ ] Image CDN integration
- [ ] Advanced search with filters
- [ ] Product analytics dashboard
- [ ] Notification system

## Acknowledgments

Built with modern web technologies and best practices. Inspired by ProductHunt.