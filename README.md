# 🎓 LearnQuest - Gamified Product Management Learning Platform

A full-stack gamified learning application similar to Duolingo, built with modern web technologies. Master product management skills through interactive lessons, earn XP, compete on leaderboards, and track your progress.

## ✨ Features

### 🎮 Core Features
- **Gamified Learning**: Earn XP, unlock achievements, and level up as you learn
- **Multiple Question Types**:
  - Multiple choice
  - Text input
  - Audio questions (text-to-speech)
  - Image selection
  - Fill in the blank
  - Match pairs
- **Spaced Repetition**: SM-2 algorithm for optimal learning retention
- **Streak Tracking**: Daily streaks with timezone support and streak freezes
- **Daily Quests**: Auto-generated challenges with XP and gem rewards
- **Leaderboard**: Global rankings with multiple rank tiers
- **Progress Dashboard**: Detailed analytics and learning statistics
- **Hearts System**: Limited attempts to encourage focus
- **Achievements**: Unlock badges and rewards

### 📊 Learning Management
- **Structured Content**: Languages → Units → Lessons → Challenges → Questions
- **Progress Tracking**: Track completion, accuracy, and improvement over time
- **Difficulty Adaptation**: Questions adapt based on user performance
- **Review System**: Spaced repetition scheduling for optimal retention

### 🛠️ Technical Features
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Prisma + PostgreSQL** for database
- **Auth.js** for authentication (Email, Google OAuth)
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **PWA Support** with offline capabilities
- **Real-time Updates** with optimistic UI
- **Admin Dashboard** for content management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd myworks
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/learning_app?schema=public"

# Auth.js
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Admin emails (comma-separated)
ADMIN_EMAILS="admin@example.com"
```

4. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open the application**
Navigate to [http://localhost:3000](http://localhost:3000)

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## 📚 Database Schema

### Core Models
- **User**: User accounts with XP, levels, hearts, gems
- **Language**: Learning languages (e.g., Product Management)
- **Unit**: Groups of related lessons
- **Lesson**: Individual learning sessions
- **Challenge**: Question sets within lessons
- **Question**: Individual questions with various types

### Gamification Models
- **UserProgress**: Lesson completion and spaced repetition data
- **UserAnswer**: Individual answer tracking
- **Streak**: Daily activity streaks
- **Quest**: Daily challenges
- **Achievement**: Unlockable badges
- **UserAchievement**: User achievement progress

## 🎯 Usage

### For Learners

1. **Sign Up**: Create an account or sign in with Google
2. **Choose a Language**: Select what you want to learn
3. **Start Learning**: Complete lessons to earn XP
4. **Track Progress**: View your dashboard for detailed stats
5. **Complete Quests**: Daily challenges for bonus rewards
6. **Compete**: Climb the leaderboard rankings

### For Admins

1. **Access Admin Panel**: Navigate to `/admin` (requires admin account)
2. **Create Languages**: Add new learning topics
3. **Build Units**: Organize lessons into units
4. **Create Lessons**: Add challenges and questions
5. **Manage Quests**: Create daily challenges
6. **Define Achievements**: Set up rewards

## 🏗️ Project Structure

```
myworks/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── learn/             # Learning interface
│   ├── leaderboard/       # Rankings
│   └── lesson/            # Lesson interface
├── components/            # React components
├── lib/                   # Utility functions
│   ├── auth.ts           # Auth configuration
│   ├── prisma.ts         # Prisma client
│   ├── scoring.ts        # XP and scoring logic
│   ├── spaced-repetition.ts  # SM-2 algorithm
│   ├── streak.ts         # Streak tracking
│   ├── leaderboard.ts    # Ranking system
│   └── quests.ts         # Quest management
├── prisma/               # Database schema
└── public/               # Static assets
```

## 🧪 Core Algorithms

### Spaced Repetition (SM-2)
Optimizes review intervals based on performance:
- Easy answers: Longer intervals
- Hard answers: Shorter intervals
- Failed answers: Reset to day 1

### Scoring System
- Base points by difficulty level
- Question type multipliers
- Speed bonuses
- First attempt bonuses
- Hint penalties

### Streak Tracking
- Timezone-aware daily tracking
- Streak freeze mechanic
- Milestone rewards

### Difficulty Adaptation
Questions adapt based on:
- User accuracy
- Time spent per question
- Recent performance trends

## 📱 PWA Features

The app includes Progressive Web App capabilities:
- Offline support
- Install to home screen
- App-like experience
- Background sync (future enhancement)
- Push notifications (future enhancement)

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## 🙏 Acknowledgments

- Inspired by Duolingo's gamification approach
- SM-2 algorithm by SuperMemo
- Built with Next.js and Prisma

---

**Happy Learning! 🎓**