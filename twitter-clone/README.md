# Twitter Clone - Full-Stack Social Microblogging Platform

A feature-rich Twitter clone built with Next.js 14, TypeScript, TailwindCSS, Prisma, and PostgreSQL. This application includes real-time updates, authentication, and all the core features you'd expect from a modern social media platform.

## Features

### Core Functionality
- ✅ **Authentication** - Username/email + password and social login (Google, GitHub) via Auth.js
- ✅ **Posts** - Create posts with 280 character limit
- ✅ **Media Support** - Image and GIF uploads
- ✅ **Interactions** - Like, reply, repost, and bookmark posts
- ✅ **User Profiles** - Customizable profiles with bio, location, website
- ✅ **Follow System** - Follow/unfollow users, view followers and following
- ✅ **Hashtags** - Automatic hashtag extraction and trending hashtags
- ✅ **Search** - Search for users, posts, and hashtags
- ✅ **Notifications** - Real-time notifications for likes, replies, reposts, and follows
- ✅ **Bookmarks** - Save posts for later
- ✅ **Moderation** - Report users and posts, admin panel for reviewing reports
- ✅ **Dark Mode** - Full dark mode support
- ✅ **Real-time Updates** - Live feed updates using Pusher
- ✅ **Infinite Scroll** - Optimized feed with React Query infinite scrolling
- ✅ **Responsive Design** - Mobile-friendly UI

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js (Auth.js)
- **Real-time:** Pusher
- **State Management:** React Query (TanStack Query)
- **Icons:** Lucide React
- **Deployment:** Docker support

## Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn
- Pusher account (for real-time features)
- (Optional) Google and GitHub OAuth apps for social login

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd twitter-clone
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Fill in the following variables in `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/twitter_clone?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Pusher (Real-time)
NEXT_PUBLIC_PUSHER_APP_KEY="your-pusher-app-key"
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_SECRET="your-pusher-secret"
NEXT_PUBLIC_PUSHER_CLUSTER="your-pusher-cluster"
```

### 4. Set up the database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## Database Schema

The application uses the following main models:

- **User** - User accounts with profile information
- **Post** - Microblog posts (280 char limit)
- **Like** - Post likes
- **Repost** - Post reposts/retweets
- **Bookmark** - Saved posts
- **Reply** - Post replies/comments
- **Follow** - User follow relationships
- **Notification** - User notifications
- **Hashtag** - Hashtag tracking
- **Report** - Content moderation reports

See `prisma/schema.prisma` for the complete schema.

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (handled by NextAuth)

### Posts
- `GET /api/posts` - Get posts feed (with pagination)
- `POST /api/posts` - Create new post
- `GET /api/posts/[postId]` - Get single post
- `DELETE /api/posts/[postId]` - Delete post
- `POST /api/posts/[postId]/like` - Like post
- `DELETE /api/posts/[postId]/like` - Unlike post
- `POST /api/posts/[postId]/repost` - Repost
- `DELETE /api/posts/[postId]/repost` - Remove repost
- `POST /api/posts/[postId]/bookmark` - Bookmark post
- `DELETE /api/posts/[postId]/bookmark` - Remove bookmark
- `GET /api/posts/[postId]/replies` - Get post replies
- `POST /api/posts/[postId]/replies` - Create reply

### Users
- `GET /api/users/[userId]` - Get user profile
- `PATCH /api/users/[userId]` - Update user profile
- `POST /api/users/[userId]/follow` - Follow user
- `DELETE /api/users/[userId]/follow` - Unfollow user

### Other
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications` - Mark notifications as read
- `GET /api/hashtags/trending` - Get trending hashtags
- `GET /api/search` - Search users, posts, and hashtags
- `GET /api/reports` - Get reports (admin only)
- `POST /api/reports` - Create report
- `PATCH /api/reports/[reportId]` - Update report status (admin only)

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma migrate deploy

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Using Docker only

```bash
# Build the image
docker build -t twitter-clone .

# Run PostgreSQL
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=twitter_clone \
  -p 5432:5432 \
  postgres:15-alpine

# Run the app
docker run -d \
  --name twitter-clone \
  -p 3000:3000 \
  --env-file .env \
  twitter-clone
```

## Setting up OAuth Providers

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

### GitHub OAuth
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Set Homepage URL: `http://localhost:3000`
4. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID and Client Secret to `.env`

## Setting up Pusher

1. Sign up at [Pusher](https://pusher.com/)
2. Create a new Channels app
3. Copy your app credentials to `.env`:
   - App ID
   - Key (goes to `NEXT_PUBLIC_PUSHER_APP_KEY`)
   - Secret
   - Cluster

## Project Structure

```
twitter-clone/
├── app/
│   ├── (app)/              # Authenticated app routes
│   │   ├── bookmarks/      # Bookmarks page
│   │   ├── explore/        # Explore/Search page
│   │   ├── notifications/  # Notifications page
│   │   ├── profile/        # User profile pages
│   │   └── page.tsx        # Home feed
│   ├── (auth)/             # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── api/                # API routes
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
├── components/
│   ├── feed/               # Feed components
│   ├── layout/             # Layout components
│   ├── post/               # Post-related components
│   └── providers/          # Context providers
├── lib/
│   ├── auth.ts             # Auth configuration
│   ├── prisma.ts           # Prisma client
│   ├── pusher.ts           # Pusher configuration
│   └── utils.ts            # Utility functions
├── prisma/
│   └── schema.prisma       # Database schema
├── types/                  # TypeScript type definitions
├── .env                    # Environment variables
├── docker-compose.yml      # Docker Compose config
├── Dockerfile              # Docker config
└── README.md               # This file
```

## Features in Detail

### Real-time Updates
The app uses Pusher for real-time updates:
- New posts appear instantly in feeds
- Notifications arrive in real-time
- Live interaction counts (likes, reposts)

### Infinite Scrolling
Uses React Query's `useInfiniteQuery` for:
- Efficient data loading
- Automatic pagination
- Optimistic updates
- Cache management

### Moderation System
- Users can report posts or other users
- Admin panel to review reports
- Multiple report statuses (PENDING, REVIEWED, RESOLVED, DISMISSED)
- User suspension capability

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `NEXTAUTH_SECRET` | Random secret for auth | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | No |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | No |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | No |
| `NEXT_PUBLIC_PUSHER_APP_KEY` | Pusher app key | Yes |
| `PUSHER_APP_ID` | Pusher app ID | Yes |
| `PUSHER_SECRET` | Pusher secret | Yes |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher cluster | Yes |

## Troubleshooting

### Database connection issues
- Ensure PostgreSQL is running
- Check `DATABASE_URL` format
- Verify database credentials

### Prisma issues
```bash
# Reset database
npx prisma migrate reset

# Regenerate client
npx prisma generate
```

### Real-time not working
- Verify Pusher credentials
- Check browser console for WebSocket errors
- Ensure Pusher cluster is correct

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for learning or building your own applications.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI inspired by [Twitter/X](https://twitter.com/)
- Icons by [Lucide](https://lucide.dev/)
