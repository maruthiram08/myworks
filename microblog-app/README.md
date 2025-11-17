# Microblog - Full-Stack Social Microblogging Platform

A modern, feature-rich microblogging platform similar to Twitter, built with Next.js 14, TypeScript, TailwindCSS, Prisma, and PostgreSQL.

![Microblog](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-brightgreen)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8)

## Features

### Core Functionality
- ✅ **Posts**: Create posts with 280 character limit
- 📸 **Media Support**: Upload images and GIFs
- 🔄 **Real-time Updates**: Live feed using Pusher/WebSockets
- ❤️ **Social Interactions**: Like, reply, repost, and bookmark posts
- 👤 **User Profiles**: Customizable profiles with followers/following
- 🔍 **Search**: Full-text search for posts and users
- #️⃣ **Trending Hashtags**: Track and explore trending topics
- 🔔 **Notifications**: Real-time notifications for likes, replies, follows
- 🌙 **Dark Mode**: Built-in dark mode support
- 🛡️ **Moderation**: Report system and admin panel
- 🔐 **Authentication**: Username + social login (Google, GitHub)

### Technical Features
- ♾️ **Infinite Scrolling**: Optimized feed with React Query
- 💾 **Smart Caching**: Efficient data caching and invalidation
- 📱 **Responsive Design**: Mobile-first responsive UI
- 🚀 **Performance**: Optimized for speed and scalability
- 🐳 **Docker Support**: Easy deployment with Docker
- 🔒 **Secure**: Auth.js for authentication, prepared statements for DB queries

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Auth.js (NextAuth) with OAuth support
- **Real-time**: Pusher (WebSockets alternative)
- **State Management**: React Query (@tanstack/react-query)
- **Styling**: TailwindCSS + CSS Modules
- **Icons**: Heroicons
- **Image Upload**: Built-in upload system (ready for cloud storage integration)

## Project Structure

```
microblog-app/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── posts/           # Posts CRUD
│   │   ├── users/           # User management
│   │   ├── notifications/   # Notifications
│   │   ├── bookmarks/       # Bookmarks
│   │   ├── search/          # Search functionality
│   │   ├── hashtags/        # Trending hashtags
│   │   └── reports/         # Moderation
│   ├── auth/                # Authentication pages
│   ├── post/[postId]/       # Post detail page
│   ├── profile/[username]/  # User profile pages
│   ├── notifications/       # Notifications page
│   ├── bookmarks/           # Bookmarks page
│   ├── search/              # Search page
│   ├── admin/               # Admin panel
│   └── page.tsx            # Home feed
├── components/
│   ├── layout/              # Layout components
│   ├── post/                # Post-related components
│   ├── user/                # User components
│   ├── ui/                  # Reusable UI components
│   └── providers/           # Context providers
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # Auth configuration
│   ├── pusher.ts           # Pusher configuration
│   └── utils.ts            # Utility functions
├── prisma/
│   └── schema.prisma       # Database schema
├── types/                   # TypeScript type definitions
├── public/                  # Static assets
└── docker-compose.yml      # Docker configuration
```

## Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL 14 or higher
- npm or yarn
- Pusher account (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd microblog-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/microblog"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
NEXT_PUBLIC_PUSHER_APP_KEY="your-pusher-key"
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_SECRET="your-pusher-secret"
NEXT_PUBLIC_PUSHER_CLUSTER="your-cluster"
```

4. **Set up the database**

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

5. **Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Database Schema

The application uses the following main models:

- **User**: User accounts with profile information
- **Post**: Microblog posts (tweets)
- **Like**: Post likes
- **Reply**: Nested replies to posts
- **Repost**: Reposted posts (retweets)
- **Bookmark**: Saved posts
- **Follow**: User follow relationships
- **Notification**: User notifications
- **Hashtag**: Trending hashtags
- **Report**: Content moderation reports

See `prisma/schema.prisma` for the complete schema.

## API Routes

### Posts
- `GET /api/posts` - Get posts feed
- `POST /api/posts` - Create a new post
- `GET /api/posts/[postId]` - Get post details
- `DELETE /api/posts/[postId]` - Delete a post
- `POST /api/posts/[postId]/like` - Like/unlike a post
- `POST /api/posts/[postId]/repost` - Repost a post
- `POST /api/posts/[postId]/bookmark` - Bookmark a post
- `GET /api/posts/[postId]/replies` - Get post replies
- `POST /api/posts/[postId]/replies` - Reply to a post

### Users
- `GET /api/users/[userId]` - Get user profile
- `PATCH /api/users/[userId]` - Update user profile
- `POST /api/users/[userId]/follow` - Follow/unfollow user

### Other
- `GET /api/notifications` - Get notifications
- `GET /api/bookmarks` - Get bookmarked posts
- `GET /api/search` - Search posts and users
- `GET /api/hashtags` - Get trending hashtags
- `GET /api/reports` - Get reports (admin only)

## Configuration

### Pusher Setup

1. Create a free account at [Pusher](https://pusher.com)
2. Create a new Channels app
3. Copy your credentials to `.env`
4. Configure allowed origins in Pusher dashboard

### OAuth Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy credentials to `.env`

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy credentials to `.env`

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including:
- Docker deployment
- Vercel deployment
- Railway deployment
- VPS deployment

### Quick Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Development

### Running Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Database Operations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (development only)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI inspired by Twitter/X
- Icons by [Heroicons](https://heroicons.com/)
- Authentication by [Auth.js](https://authjs.dev/)

## Support

For support, please:
- Open an issue on GitHub
- Check the [Deployment Guide](./DEPLOYMENT.md)
- Review the API documentation

---

**Built with ❤️ using Next.js 14**
