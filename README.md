# LinguaQuest - Gamified Language Learning App

A full-stack language learning application similar to Duolingo, built with Next.js 14, TypeScript, TailwindCSS, Prisma, and PostgreSQL.

## Features

- **Authentication**: Email and Google OAuth via Auth.js
- **Structured Learning**: Languages → Units → Lessons → Challenges → Questions
- **Gamification**: XP points, levels, streaks, daily quests, achievements
- **Spaced Repetition**: Smart review system for optimal learning
- **Multiple Question Types**: Multiple choice, text input, audio, images, translations
- **Leaderboards**: Daily, weekly, monthly, and all-time rankings
- **Progress Tracking**: Detailed analytics and learning statistics
- **Notifications**: Email and push notifications for streaks and quests
- **Admin System**: Complete CRUD interface for managing content
- **PWA Support**: Offline functionality and installable app
- **Animations & Sounds**: Engaging gamified user experience

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Auth.js (NextAuth v5)
- **State Management**: Zustand, React Query
- **Animations**: Framer Motion
- **Charts**: Recharts
- **UI Components**: Custom components with TailwindCSS

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd myworks
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and fill in your configuration:
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
- Email service credentials (optional)

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. (Optional) Seed the database with sample data:
```bash
npm run seed
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses a comprehensive schema including:

- **Users & Auth**: User accounts, sessions, OAuth providers
- **Learning Content**: Languages, units, lessons, challenges, questions
- **Progress Tracking**: User progress, lesson sessions, answers
- **Gamification**: Streaks, quests, achievements, leaderboards
- **Notifications**: Email and push notification management

## Key Algorithms

### Spaced Repetition (SM-2)

The app uses the SuperMemo SM-2 algorithm for optimal review scheduling:
- Tracks ease factor for each lesson
- Calculates next review date based on performance
- Adapts difficulty based on user accuracy

### Scoring System

- Base XP per lesson: 10 XP
- Accuracy bonus: Up to 10 XP for perfect scores
- Speed bonus: Extra XP for quick completions
- Streak multiplier: 2x XP during active streaks
- Perfect lesson: No hearts lost bonus

### Streak Tracking

- Daily activity required to maintain streak
- Streak freeze available (with gems)
- Notifications for streak safety
- Longest streak tracking

## Admin Features

Admins can manage all content through the admin dashboard:

- Create and edit languages
- Build learning units and lessons
- Add questions with various types
- Monitor user progress
- Manage achievements and quests
- View analytics and statistics

## API Routes

- `/api/auth/*` - Authentication endpoints
- `/api/lessons/*` - Lesson and progress management
- `/api/quests/*` - Daily quests
- `/api/leaderboard/*` - Rankings and stats
- `/api/admin/*` - Admin CRUD operations

## PWA Features

- Offline lesson caching
- Install prompt
- Background sync for progress
- Push notifications
- App-like experience on mobile

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run Prisma Studio
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Push schema changes
npx prisma db push
```

## Contributing

Contributions are welcome! Please follow the existing code style and patterns.

## License

MIT License
