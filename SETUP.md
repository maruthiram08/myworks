# LinguaQuest Setup Guide

## Quick Start

Follow these steps to get your LinguaQuest application running locally.

### 1. Prerequisites

Make sure you have the following installed:
- Node.js 18 or higher
- PostgreSQL database
- npm or yarn

### 2. Clone and Install

```bash
# Navigate to project directory
cd myworks

# Install dependencies
npm install --legacy-peer-deps
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/linguaquest?schema=public"

# Auth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Database Setup

```bash
# Push the Prisma schema to your database
npm run db:push

# Seed the database with sample data
npm run seed
```

### 5. Run the Application

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to your `.env` file

## Database Management

```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# Push schema changes
npm run db:push

# Re-seed database
npm run seed
```

## Features Included

- ✅ Authentication (Email + Google OAuth)
- ✅ Language Learning System
- ✅ Spaced Repetition Algorithm
- ✅ Gamification (XP, Levels, Streaks)
- ✅ Daily Quests
- ✅ Leaderboards
- ✅ Progress Tracking
- ✅ PWA Support
- ✅ Responsive Design

## Project Structure

```
myworks/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── learn/             # Learning dashboard
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # UI components
│   └── gamification/     # Gamification components
├── lib/                  # Utility functions
│   ├── prisma.ts         # Prisma client
│   ├── scoring.ts        # Scoring system
│   ├── spaced-repetition.ts
│   └── streaks.ts        # Streak tracking
├── prisma/               # Database
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
└── public/               # Static files
```

## Default Test Account

After seeding, you can create a test account:

1. Go to http://localhost:3000/auth/signup
2. Create an account with any email/password
3. Start learning!

## Admin Features

To make a user an admin:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

Then access admin features at `/admin`

## Troubleshooting

### Prisma Issues

If you encounter Prisma-related errors:
```bash
npx prisma generate
npm run db:push
```

### Database Connection

Make sure PostgreSQL is running and the connection string in `.env` is correct.

### Port Already in Use

If port 3000 is taken:
```bash
PORT=3001 npm run dev
```

## Next Steps

1. Customize the languages and content in the seed script
2. Add more question types and challenges
3. Implement audio features with text-to-speech
4. Set up email notifications
5. Deploy to production

## Support

For issues or questions, please check the README.md or create an issue in the repository.

Happy Learning! 🎉
