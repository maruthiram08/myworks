import { PrismaClient, QuestionType, DifficultyLevel, QuestType, AchievementCategory } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create Product Management language
  console.log('📚 Creating language...')
  const pmLanguage = await prisma.language.create({
    data: {
      name: 'Product Management',
      code: 'pm',
      flag: '📊',
      description: 'Master the fundamentals of product management',
      isActive: true,
    },
  })

  // Create Units
  console.log('📖 Creating units...')
  const units = await Promise.all([
    prisma.unit.create({
      data: {
        languageId: pmLanguage.id,
        title: 'Product Management Fundamentals',
        description: 'Learn the basics of product management',
        order: 1,
        color: '#22c55e',
        isLocked: false,
      },
    }),
    prisma.unit.create({
      data: {
        languageId: pmLanguage.id,
        title: 'User Research & Discovery',
        description: 'Understanding user needs and market research',
        order: 2,
        color: '#3b82f6',
        isLocked: false,
      },
    }),
    prisma.unit.create({
      data: {
        languageId: pmLanguage.id,
        title: 'Product Strategy',
        description: 'Strategic thinking and roadmap planning',
        order: 3,
        color: '#8b5cf6',
        isLocked: false,
      },
    }),
    prisma.unit.create({
      data: {
        languageId: pmLanguage.id,
        title: 'Metrics & Analytics',
        description: 'Data-driven decision making',
        order: 4,
        color: '#f59e0b',
        isLocked: false,
      },
    }),
  ])

  // Create Lessons for Unit 1
  console.log('📝 Creating lessons...')
  const lesson1 = await prisma.lesson.create({
    data: {
      unitId: units[0].id,
      title: 'What is Product Management?',
      description: 'Introduction to the role of a product manager',
      order: 1,
    },
  })

  const lesson2 = await prisma.lesson.create({
    data: {
      unitId: units[0].id,
      title: 'Product Manager Responsibilities',
      description: 'Key responsibilities and daily tasks',
      order: 2,
    },
  })

  const lesson3 = await prisma.lesson.create({
    data: {
      unitId: units[0].id,
      title: 'Product Lifecycle',
      description: 'Understanding product development stages',
      order: 3,
    },
  })

  // Create Lessons for Unit 2
  const lesson4 = await prisma.lesson.create({
    data: {
      unitId: units[1].id,
      title: 'User Interviews',
      description: 'Conducting effective user research',
      order: 1,
    },
  })

  const lesson5 = await prisma.lesson.create({
    data: {
      unitId: units[1].id,
      title: 'Personas & User Stories',
      description: 'Creating user personas and stories',
      order: 2,
    },
  })

  // Create Challenges and Questions for Lesson 1
  console.log('❓ Creating challenges and questions...')
  const challenge1 = await prisma.challenge.create({
    data: {
      lessonId: lesson1.id,
      order: 1,
    },
  })

  await prisma.question.createMany({
    data: [
      {
        challengeId: challenge1.id,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: DifficultyLevel.BEGINNER,
        order: 1,
        prompt: 'What is the primary role of a Product Manager?',
        options: JSON.stringify([
          'Writing code for the product',
          'Defining product vision and strategy',
          'Managing the sales team',
          'Designing user interfaces',
        ]),
        correctAnswer: 'Defining product vision and strategy',
        hint: 'Think about who sets the direction for the product',
        explanation: 'Product Managers are responsible for defining the product vision, strategy, and roadmap. They don\'t typically write code or design UIs directly.',
        points: 10,
      },
      {
        challengeId: challenge1.id,
        type: QuestionType.TEXT_INPUT,
        difficulty: DifficultyLevel.BEGINNER,
        order: 2,
        prompt: 'What does PM stand for in the tech industry?',
        correctAnswer: 'Product Manager',
        alternativeAnswers: JSON.stringify(['product manager', 'Product management']),
        hint: 'It\'s a role, not a thing',
        explanation: 'PM stands for Product Manager, the person responsible for a product\'s success.',
        points: 10,
      },
      {
        challengeId: challenge1.id,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: DifficultyLevel.INTERMEDIATE,
        order: 3,
        prompt: 'Which of the following is NOT typically a Product Manager responsibility?',
        options: JSON.stringify([
          'Prioritizing features in the backlog',
          'Writing production code',
          'Gathering user feedback',
          'Creating product roadmaps',
        ]),
        correctAnswer: 'Writing production code',
        hint: 'PMs focus on the "what" and "why", not the "how"',
        explanation: 'While PMs need technical understanding, they don\'t typically write production code. That\'s the engineering team\'s responsibility.',
        points: 15,
      },
    ],
  })

  // Create more challenges for Lesson 2
  const challenge2 = await prisma.challenge.create({
    data: {
      lessonId: lesson2.id,
      order: 1,
    },
  })

  await prisma.question.createMany({
    data: [
      {
        challengeId: challenge2.id,
        type: QuestionType.FILL_BLANK,
        difficulty: DifficultyLevel.BEGINNER,
        order: 1,
        prompt: 'A Product Manager acts as the ___ between engineering, design, and business teams.',
        correctAnswer: 'bridge',
        alternativeAnswers: JSON.stringify(['connector', 'link', 'liaison']),
        explanation: 'PMs bridge different teams and ensure everyone is aligned on product goals.',
        points: 10,
      },
      {
        challengeId: challenge2.id,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: DifficultyLevel.INTERMEDIATE,
        order: 2,
        prompt: 'What does a Product Roadmap communicate?',
        options: JSON.stringify([
          'Detailed technical specifications',
          'Strategic direction and timeline of features',
          'Individual developer tasks',
          'Marketing campaigns',
        ]),
        correctAnswer: 'Strategic direction and timeline of features',
        hint: 'Think about long-term planning',
        explanation: 'A product roadmap shows the strategic direction and planned features over time, helping align teams.',
        points: 15,
      },
      {
        challengeId: challenge2.id,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: DifficultyLevel.ADVANCED,
        order: 3,
        prompt: 'Which framework is commonly used for prioritizing features?',
        options: JSON.stringify([
          'RICE (Reach, Impact, Confidence, Effort)',
          'SOLID principles',
          'REST API',
          'Agile Manifesto',
        ]),
        correctAnswer: 'RICE (Reach, Impact, Confidence, Effort)',
        explanation: 'RICE is a popular prioritization framework that helps PMs make data-driven decisions about which features to build.',
        points: 20,
      },
    ],
  })

  // Create challenges for Lesson 3
  const challenge3 = await prisma.challenge.create({
    data: {
      lessonId: lesson3.id,
      order: 1,
    },
  })

  await prisma.question.createMany({
    data: [
      {
        challengeId: challenge3.id,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: DifficultyLevel.BEGINNER,
        order: 1,
        prompt: 'Which stage comes first in the product lifecycle?',
        options: JSON.stringify([
          'Growth',
          'Discovery',
          'Maturity',
          'Decline',
        ]),
        correctAnswer: 'Discovery',
        hint: 'Think about when you\'re exploring the problem',
        explanation: 'Discovery is the first stage where you research the market, users, and validate the product idea.',
        points: 10,
      },
      {
        challengeId: challenge3.id,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: DifficultyLevel.INTERMEDIATE,
        order: 2,
        prompt: 'What is an MVP (Minimum Viable Product)?',
        options: JSON.stringify([
          'A fully-featured product',
          'A product with just enough features to validate learning',
          'The most expensive version of a product',
          'A product for VIP customers only',
        ]),
        correctAnswer: 'A product with just enough features to validate learning',
        explanation: 'An MVP is the simplest version of a product that allows you to test core hypotheses and learn from users.',
        points: 15,
      },
      {
        challengeId: challenge3.id,
        type: QuestionType.FILL_BLANK,
        difficulty: DifficultyLevel.INTERMEDIATE,
        order: 3,
        prompt: 'Product-market ___ is when your product satisfies a strong market demand.',
        correctAnswer: 'fit',
        explanation: 'Product-market fit is the degree to which a product satisfies strong market demand.',
        points: 15,
      },
    ],
  })

  // Create challenges for Lesson 4 (User Research)
  const challenge4 = await prisma.challenge.create({
    data: {
      lessonId: lesson4.id,
      order: 1,
    },
  })

  await prisma.question.createMany({
    data: [
      {
        challengeId: challenge4.id,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: DifficultyLevel.BEGINNER,
        order: 1,
        prompt: 'What is the goal of user interviews?',
        options: JSON.stringify([
          'To sell your product to users',
          'To understand user needs and pain points',
          'To teach users how to use your product',
          'To collect payment information',
        ]),
        correctAnswer: 'To understand user needs and pain points',
        hint: 'Focus on learning, not selling',
        explanation: 'User interviews help you deeply understand user needs, behaviors, and pain points to build better products.',
        points: 10,
      },
      {
        challengeId: challenge4.id,
        type: QuestionType.TEXT_INPUT,
        difficulty: DifficultyLevel.INTERMEDIATE,
        order: 2,
        prompt: 'What type of questions should you avoid in user interviews? (One word)',
        correctAnswer: 'leading',
        alternativeAnswers: JSON.stringify(['Leading', 'biased', 'Biased']),
        hint: 'Questions that suggest a particular answer',
        explanation: 'Leading questions bias the respondent and don\'t provide authentic insights. Ask open-ended, neutral questions.',
        points: 15,
      },
      {
        challengeId: challenge4.id,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: DifficultyLevel.ADVANCED,
        order: 3,
        prompt: 'Which research method is best for understanding "why" users behave a certain way?',
        options: JSON.stringify([
          'A/B testing',
          'Analytics data',
          'Qualitative interviews',
          'Survey with rating scales',
        ]),
        correctAnswer: 'Qualitative interviews',
        explanation: 'Qualitative interviews provide deep insights into user motivations and reasoning, while quantitative methods tell you "what" happens.',
        points: 20,
      },
    ],
  })

  // Create Daily Quests
  console.log('🎯 Creating quests...')
  await prisma.quest.createMany({
    data: [
      {
        type: QuestType.COMPLETE_LESSONS,
        title: 'Daily Learner',
        description: 'Complete 3 lessons today',
        target: 3,
        xpReward: 50,
        gemsReward: 5,
        isDaily: true,
        isActive: true,
      },
      {
        type: QuestType.COMPLETE_LESSONS,
        title: 'Dedicated Student',
        description: 'Complete 5 lessons today',
        target: 5,
        xpReward: 100,
        gemsReward: 10,
        isDaily: true,
        isActive: true,
      },
      {
        type: QuestType.EARN_XP,
        title: 'XP Hunter',
        description: 'Earn 100 XP today',
        target: 100,
        xpReward: 25,
        gemsReward: 3,
        isDaily: true,
        isActive: true,
      },
      {
        type: QuestType.EARN_XP,
        title: 'XP Master',
        description: 'Earn 250 XP today',
        target: 250,
        xpReward: 75,
        gemsReward: 8,
        isDaily: true,
        isActive: true,
      },
      {
        type: QuestType.PERFECT_SCORE,
        title: 'Perfectionist',
        description: 'Get a perfect score on 1 lesson',
        target: 1,
        xpReward: 75,
        gemsReward: 7,
        isDaily: true,
        isActive: true,
      },
      {
        type: QuestType.PERFECT_SCORE,
        title: 'Perfect Trio',
        description: 'Get perfect scores on 3 lessons',
        target: 3,
        xpReward: 150,
        gemsReward: 15,
        isDaily: true,
        isActive: true,
      },
      {
        type: QuestType.USE_APP_STREAK,
        title: 'Streak Keeper',
        description: 'Maintain your learning streak',
        target: 1,
        xpReward: 30,
        gemsReward: 3,
        isDaily: true,
        isActive: true,
      },
      {
        type: QuestType.REVIEW_LESSONS,
        title: 'Review Master',
        description: 'Review 2 previous lessons',
        target: 2,
        xpReward: 40,
        gemsReward: 4,
        isDaily: true,
        isActive: true,
      },
    ],
  })

  // Create Achievements
  console.log('🏆 Creating achievements...')
  await prisma.achievement.createMany({
    data: [
      // Lesson achievements
      {
        category: AchievementCategory.LESSONS,
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        requirement: 1,
        xpReward: 50,
      },
      {
        category: AchievementCategory.LESSONS,
        title: 'Getting Started',
        description: 'Complete 5 lessons',
        icon: '📚',
        requirement: 5,
        xpReward: 100,
      },
      {
        category: AchievementCategory.LESSONS,
        title: 'Dedicated Learner',
        description: 'Complete 25 lessons',
        icon: '📖',
        requirement: 25,
        xpReward: 250,
      },
      {
        category: AchievementCategory.LESSONS,
        title: 'Learning Machine',
        description: 'Complete 50 lessons',
        icon: '🤖',
        requirement: 50,
        xpReward: 500,
      },
      {
        category: AchievementCategory.LESSONS,
        title: 'Master Student',
        description: 'Complete 100 lessons',
        icon: '🎓',
        requirement: 100,
        xpReward: 1000,
      },
      // Streak achievements
      {
        category: AchievementCategory.STREAKS,
        title: 'On Fire',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        requirement: 7,
        xpReward: 100,
      },
      {
        category: AchievementCategory.STREAKS,
        title: 'Consistency King',
        description: 'Maintain a 30-day streak',
        icon: '👑',
        requirement: 30,
        xpReward: 500,
      },
      {
        category: AchievementCategory.STREAKS,
        title: 'Unstoppable',
        description: 'Maintain a 100-day streak',
        icon: '⚡',
        requirement: 100,
        xpReward: 2000,
      },
      // XP achievements
      {
        category: AchievementCategory.XP,
        title: 'Rising Star',
        description: 'Reach 1,000 XP',
        icon: '⭐',
        requirement: 1000,
        xpReward: 100,
      },
      {
        category: AchievementCategory.XP,
        title: 'Power Player',
        description: 'Reach 5,000 XP',
        icon: '💫',
        requirement: 5000,
        xpReward: 500,
      },
      {
        category: AchievementCategory.XP,
        title: 'Legend',
        description: 'Reach 10,000 XP',
        icon: '🌟',
        requirement: 10000,
        xpReward: 1000,
      },
      // Perfect score achievements
      {
        category: AchievementCategory.PERFECT_SCORES,
        title: 'Perfectionist',
        description: 'Get 5 perfect scores',
        icon: '💯',
        requirement: 5,
        xpReward: 150,
      },
      {
        category: AchievementCategory.PERFECT_SCORES,
        title: 'Flawless',
        description: 'Get 25 perfect scores',
        icon: '✨',
        requirement: 25,
        xpReward: 500,
      },
      {
        category: AchievementCategory.PERFECT_SCORES,
        title: 'Perfect Master',
        description: 'Get 100 perfect scores',
        icon: '🏅',
        requirement: 100,
        xpReward: 2000,
      },
      // Speed achievements
      {
        category: AchievementCategory.SPEED,
        title: 'Quick Learner',
        description: 'Complete 10 lessons with speed bonus',
        icon: '⚡',
        requirement: 10,
        xpReward: 200,
      },
      {
        category: AchievementCategory.SPEED,
        title: 'Lightning Fast',
        description: 'Complete 50 lessons with speed bonus',
        icon: '⚡',
        requirement: 50,
        xpReward: 1000,
      },
    ],
  })

  console.log('✅ Seed completed successfully!')
  console.log(`
    Created:
    - 1 Language (Product Management)
    - 4 Units
    - 5 Lessons
    - 4 Challenges
    - 15 Questions
    - 8 Daily Quests
    - 18 Achievements
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
