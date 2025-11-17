# Setup Guide

## Quick Start

### 1. Database Setup

First, ensure PostgreSQL is installed and running on your system.

Create a new database:
```bash
createdb learning_app
```

Or using psql:
```sql
CREATE DATABASE learning_app;
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Update `.env` with your configuration:

**Required:**
- `DATABASE_URL`: Your PostgreSQL connection string
- `AUTH_SECRET`: Generate with `openssl rand -base64 32`

**Optional:**
- Google OAuth credentials (for Google sign-in)
- Email server settings (for email auth)

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 5. Create Admin User

You have two options:

**Option A: Sign up normally and manually set admin flag**
```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'your@email.com';
```

**Option B: Use Prisma Studio**
```bash
npx prisma studio
```
Then navigate to User model and set `isAdmin` to `true`.

### 6. (Optional) Seed Sample Data

Create a seed file `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Create a sample language
  const language = await prisma.language.create({
    data: {
      name: 'Product Management',
      code: 'pm',
      flag: '📊',
      description: 'Learn the fundamentals of product management',
    },
  })

  // Create a unit
  const unit = await prisma.unit.create({
    data: {
      languageId: language.id,
      title: 'Getting Started',
      description: 'Introduction to product management',
      order: 1,
      color: '#22c55e',
    },
  })

  // Create sample quests
  await prisma.quest.createMany({
    data: [
      {
        type: 'COMPLETE_LESSONS',
        title: 'Complete 3 lessons',
        description: 'Finish 3 lessons today',
        target: 3,
        xpReward: 50,
        gemsReward: 5,
        isDaily: true,
      },
      {
        type: 'EARN_XP',
        title: 'Earn 100 XP',
        description: 'Gain 100 experience points',
        target: 100,
        xpReward: 25,
        gemsReward: 3,
        isDaily: true,
      },
    ],
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Run seed:
```bash
npm install -D ts-node
npx prisma db seed
```

### 7. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Setting Up Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

## Production Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Set up PostgreSQL database (Vercel Postgres or external)
5. Deploy

### Environment Variables for Production
- Set `AUTH_URL` to your production domain
- Use strong `AUTH_SECRET`
- Configure production database
- Update Google OAuth redirect URIs

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

### Prisma Errors
```bash
# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset

# Regenerate client
npx prisma generate
```

### Auth Issues
- Clear browser cookies
- Verify AUTH_SECRET is set
- Check OAuth credentials

## Creating Your First Content

1. Sign in as admin
2. Navigate to `/admin`
3. Create a Language
4. Add Units to the language
5. Create Lessons in units
6. Add Challenges to lessons
7. Create Questions in challenges

## Next Steps

- Review the main README.md
- Explore the codebase
- Customize themes and branding
- Add your own content
- Deploy to production

Happy coding! 🚀
