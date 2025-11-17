import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Languages
  console.log('Creating languages...');
  const spanish = await prisma.language.upsert({
    where: { code: 'es' },
    update: {},
    create: {
      name: 'Spanish',
      code: 'es',
      flag: '🇪🇸',
      description: 'Learn Spanish from scratch',
      isActive: true,
      order: 1,
    },
  });

  const french = await prisma.language.upsert({
    where: { code: 'fr' },
    update: {},
    create: {
      name: 'French',
      code: 'fr',
      flag: '🇫🇷',
      description: 'Master the language of love',
      isActive: true,
      order: 2,
    },
  });

  const german = await prisma.language.upsert({
    where: { code: 'de' },
    update: {},
    create: {
      name: 'German',
      code: 'de',
      flag: '🇩🇪',
      description: 'Learn German efficiently',
      isActive: true,
      order: 3,
    },
  });

  const japanese = await prisma.language.upsert({
    where: { code: 'ja' },
    update: {},
    create: {
      name: 'Japanese',
      code: 'ja',
      flag: '🇯🇵',
      description: 'Explore Japanese language and culture',
      isActive: true,
      order: 4,
    },
  });

  console.log('✅ Languages created');

  // Create Units for Spanish
  console.log('Creating units and lessons for Spanish...');
  const unit1 = await prisma.unit.create({
    data: {
      languageId: spanish.id,
      title: 'Unit 1: Basics',
      description: 'Learn basic Spanish greetings and introductions',
      order: 1,
      isLocked: false,
      requiredXP: 0,
    },
  });

  const unit2 = await prisma.unit.create({
    data: {
      languageId: spanish.id,
      title: 'Unit 2: Food & Drink',
      description: 'Vocabulary for food and beverages',
      order: 2,
      isLocked: false,
      requiredXP: 50,
    },
  });

  // Create Lessons for Unit 1
  const lesson1 = await prisma.lesson.create({
    data: {
      unitId: unit1.id,
      title: 'Greetings',
      description: 'Learn how to greet people in Spanish',
      order: 1,
      xpReward: 10,
      heartsRequired: 0,
    },
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      unitId: unit1.id,
      title: 'Introductions',
      description: 'Introduce yourself and others',
      order: 2,
      xpReward: 15,
      heartsRequired: 0,
    },
  });

  const lesson3 = await prisma.lesson.create({
    data: {
      unitId: unit1.id,
      title: 'Common Phrases',
      description: 'Essential phrases for beginners',
      order: 3,
      xpReward: 15,
      heartsRequired: 0,
    },
  });

  console.log('✅ Units and lessons created');

  // Create Challenges and Questions for Lesson 1
  console.log('Creating challenges and questions...');
  const challenge1 = await prisma.challenge.create({
    data: {
      lessonId: lesson1.id,
      type: 'SELECT',
      order: 1,
    },
  });

  const challenge2 = await prisma.challenge.create({
    data: {
      lessonId: lesson1.id,
      type: 'ASSIST',
      order: 2,
    },
  });

  // Questions for Challenge 1
  await prisma.question.createMany({
    data: [
      {
        challengeId: challenge1.id,
        questionType: 'MULTIPLE_CHOICE',
        question: 'How do you say "Hello" in Spanish?',
        answer: 'Hola',
        options: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
        translation: 'Hello',
        difficulty: 1,
        order: 1,
      },
      {
        challengeId: challenge1.id,
        questionType: 'MULTIPLE_CHOICE',
        question: 'What does "Buenos días" mean?',
        answer: 'Good morning',
        options: ['Good morning', 'Good night', 'Goodbye', 'Thank you'],
        translation: 'Good morning',
        difficulty: 1,
        order: 2,
      },
      {
        challengeId: challenge1.id,
        questionType: 'MULTIPLE_CHOICE',
        question: 'How do you say "Goodbye" in Spanish?',
        answer: 'Adiós',
        options: ['Hola', 'Adiós', 'Gracias', 'De nada'],
        translation: 'Goodbye',
        difficulty: 1,
        order: 3,
      },
      {
        challengeId: challenge2.id,
        questionType: 'TRANSLATE',
        question: 'Translate: Good afternoon',
        answer: 'Buenas tardes',
        options: ['Buenas tardes', 'Buenos días', 'Buenas noches', 'Hola'],
        translation: 'Good afternoon',
        difficulty: 2,
        order: 1,
      },
      {
        challengeId: challenge2.id,
        questionType: 'TEXT_INPUT',
        question: 'Type "Thank you" in Spanish',
        answer: 'Gracias',
        options: [],
        translation: 'Thank you',
        difficulty: 2,
        order: 2,
      },
    ],
  });

  console.log('✅ Challenges and questions created');

  // Create Daily Quests
  console.log('Creating daily quests...');
  await prisma.dailyQuest.createMany({
    data: [
      {
        title: 'Complete 3 Lessons',
        description: 'Finish 3 lessons today',
        type: 'COMPLETE_LESSONS',
        target: 3,
        xpReward: 50,
        gemReward: 5,
        isActive: true,
      },
      {
        title: 'Earn 100 XP',
        description: 'Accumulate 100 XP points',
        type: 'EARN_XP',
        target: 100,
        xpReward: 25,
        gemReward: 3,
        isActive: true,
      },
      {
        title: 'Perfect Lesson',
        description: 'Complete a lesson with 100% accuracy',
        type: 'PERFECT_LESSON',
        target: 1,
        xpReward: 75,
        gemReward: 10,
        isActive: true,
      },
      {
        title: 'No Hearts Lost',
        description: 'Complete a lesson without losing hearts',
        type: 'USE_NO_HEARTS',
        target: 1,
        xpReward: 50,
        gemReward: 5,
        isActive: true,
      },
    ],
  });

  console.log('✅ Daily quests created');

  // Create Achievements
  console.log('Creating achievements...');
  await prisma.achievement.createMany({
    data: [
      {
        title: '🔥 First Streak',
        description: 'Maintain a 3-day learning streak',
        icon: '🔥',
        category: 'STREAK',
        requirement: 3,
        xpReward: 100,
        gemReward: 25,
        isSecret: false,
      },
      {
        title: '⭐ Week Warrior',
        description: 'Maintain a 7-day learning streak',
        icon: '⭐',
        category: 'STREAK',
        requirement: 7,
        xpReward: 250,
        gemReward: 50,
        isSecret: false,
      },
      {
        title: '📚 Bookworm',
        description: 'Complete 10 lessons',
        icon: '📚',
        category: 'LESSONS',
        requirement: 10,
        xpReward: 150,
        gemReward: 30,
        isSecret: false,
      },
      {
        title: '🎯 Perfectionist',
        description: 'Complete 5 perfect lessons',
        icon: '🎯',
        category: 'PERFECT',
        requirement: 5,
        xpReward: 200,
        gemReward: 40,
        isSecret: false,
      },
      {
        title: '🏆 XP Master',
        description: 'Earn 1000 total XP',
        icon: '🏆',
        category: 'XP',
        requirement: 1000,
        xpReward: 300,
        gemReward: 100,
        isSecret: false,
      },
      {
        title: '💎 Hidden Gem',
        description: 'Find the secret achievement',
        icon: '💎',
        category: 'XP',
        requirement: 1,
        xpReward: 500,
        gemReward: 200,
        isSecret: true,
      },
    ],
  });

  console.log('✅ Achievements created');
  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
