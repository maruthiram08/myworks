import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Hearts } from '@/components/gamification/Hearts';
import { XPDisplay } from '@/components/gamification/XPDisplay';
import { StreakDisplay } from '@/components/gamification/StreakDisplay';
import { progressToNextLevel, calculateLevel } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Trophy, Target, BookOpen, Star, Lock, CheckCircle2 } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default async function LearnPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Fetch user profile
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      selectedLanguage: {
        include: {
          units: {
            include: {
              lessons: {
                include: {
                  challenges: true,
                },
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  // Fetch all languages
  const languages = await prisma.language.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  // Fetch daily quests (placeholder - would need actual quest generation)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!profile) {
    // Create profile if it doesn't exist
    await prisma.userProfile.create({
      data: {
        userId: session.user.id,
        xp: 0,
        level: 1,
        hearts: 5,
        gems: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
    });
    redirect('/learn');
  }

  const currentLevel = calculateLevel(profile.xp);
  const progress = progressToNextLevel(profile.xp);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-600">LinguaQuest</h1>

            <div className="flex items-center gap-6">
              <Hearts current={profile.hearts} max={5} />
              <StreakDisplay streak={profile.currentStreak} />
              <div className="flex items-center gap-2 bg-accent-50 px-3 py-2 rounded-lg">
                <Star className="w-5 h-5 text-accent-500" />
                <span className="font-bold text-accent-600">{profile.gems}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Language Selection */}
            {!profile.selectedLanguageId && (
              <Card>
                <h2 className="text-2xl font-bold mb-4">Choose Your Language</h2>
                <div className="grid grid-cols-2 gap-4">
                  {languages.length === 0 ? (
                    <p className="col-span-2 text-gray-600">
                      No languages available yet. Please contact an administrator.
                    </p>
                  ) : (
                    languages.map((language) => (
                      <button
                        key={language.id}
                        className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all"
                      >
                        <div className="text-4xl mb-2">{language.flag}</div>
                        <div className="font-bold">{language.name}</div>
                      </button>
                    ))
                  )}
                </div>
              </Card>
            )}

            {/* Learning Path */}
            {profile.selectedLanguage && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {profile.selectedLanguage.flag} {profile.selectedLanguage.name}
                  </h2>
                  <Button variant="outline" size="sm">
                    Change Language
                  </Button>
                </div>

                {profile.selectedLanguage.units.length === 0 ? (
                  <Card>
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        No Lessons Yet
                      </h3>
                      <p className="text-gray-600">
                        Lessons for this language are coming soon!
                      </p>
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {profile.selectedLanguage.units.map((unit, unitIndex) => (
                      <Card key={unit.id}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-xl font-bold text-primary-600">
                              {unitIndex + 1}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{unit.title}</h3>
                            {unit.description && (
                              <p className="text-sm text-gray-600">{unit.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-3">
                          {unit.lessons.map((lesson, lessonIndex) => {
                            const isLocked = unit.isLocked || lessonIndex > 0;
                            return (
                              <div
                                key={lesson.id}
                                className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                                  isLocked
                                    ? 'border-gray-200 bg-gray-50'
                                    : 'border-primary-200 bg-primary-50 hover:border-primary-400 cursor-pointer'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                      isLocked ? 'bg-gray-200' : 'bg-primary-500'
                                    }`}
                                  >
                                    {isLocked ? (
                                      <Lock className="w-5 h-5 text-gray-500" />
                                    ) : (
                                      <BookOpen className="w-5 h-5 text-white" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-semibold">{lesson.title}</div>
                                    {lesson.description && (
                                      <div className="text-sm text-gray-600">
                                        {lesson.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1 text-sm">
                                    <Star className="w-4 h-4 text-accent-500" />
                                    <span className="font-semibold">{lesson.xpReward} XP</span>
                                  </div>
                                  {!isLocked && (
                                    <Button size="sm">Start</Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
                  {session.user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <h3 className="font-bold text-lg">{session.user.name}</h3>
                <p className="text-sm text-gray-600 mb-4">Level {currentLevel}</p>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Progress to Level {currentLevel + 1}</span>
                    <span className="text-gray-600">{Math.round(progress)}%</span>
                  </div>
                  <ProgressBar value={progress} />
                </div>

                <div className="flex justify-center gap-2 mb-4">
                  <XPDisplay xp={profile.xp} />
                </div>

                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Daily Quests */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary-600" />
                <h3 className="font-bold">Daily Quests</h3>
              </div>
              <div className="space-y-3">
                <DailyQuestItem
                  title="Complete 3 lessons"
                  progress={0}
                  target={3}
                  reward={50}
                />
                <DailyQuestItem
                  title="Earn 100 XP"
                  progress={0}
                  target={100}
                  reward={25}
                />
                <DailyQuestItem
                  title="Perfect lesson"
                  progress={0}
                  target={1}
                  reward={75}
                />
              </div>
            </Card>

            {/* Leaderboard Preview */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="font-bold">Leaderboard</h3>
              </div>
              <Link href="/leaderboard">
                <Button variant="outline" className="w-full">
                  View Full Leaderboard
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function DailyQuestItem({
  title,
  progress,
  target,
  reward,
}: {
  title: string;
  progress: number;
  target: number;
  reward: number;
}) {
  const percentage = (progress / target) * 100;
  const isComplete = progress >= target;

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{title}</span>
        {isComplete && <CheckCircle2 className="w-4 h-4 text-green-500" />}
      </div>
      <ProgressBar value={percentage} size="sm" variant={isComplete ? 'success' : 'default'} />
      <div className="flex justify-between items-center mt-2 text-xs">
        <span className="text-gray-600">
          {progress}/{target}
        </span>
        <span className="font-semibold text-accent-600">+{reward} XP</span>
      </div>
    </div>
  );
}
