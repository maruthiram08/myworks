import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Star, Flame, Trophy, Target, Zap, Globe } from 'lucide-react';

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect('/learn');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-primary-600">LinguaQuest</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Learn Languages the
          <span className="text-primary-600"> Fun Way</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Master new languages through gamified lessons, daily quests, and friendly competition.
          Build streaks, earn XP, and climb the leaderboards!
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/auth/signup">
            <Button size="lg" className="text-lg px-8 py-4">
              Start Learning Free
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button size="lg" variant="outline" className="text-lg px-8 py-4">
              I Have an Account
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600">10+</div>
            <div className="text-gray-600 mt-2">Languages</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600">500+</div>
            <div className="text-gray-600 mt-2">Lessons</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600">50K+</div>
            <div className="text-gray-600 mt-2">Learners</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600">Free</div>
            <div className="text-gray-600 mt-2">Forever</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Why LinguaQuest?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Star className="w-8 h-8 text-accent-500" />}
            title="Earn XP & Level Up"
            description="Complete lessons, earn experience points, and level up your language skills. Track your progress with detailed statistics."
          />
          <FeatureCard
            icon={<Flame className="w-8 h-8 text-orange-500" />}
            title="Build Streaks"
            description="Learn daily to build your streak. Don't break the chain! Unlock special rewards for milestone streaks."
          />
          <FeatureCard
            icon={<Trophy className="w-8 h-8 text-yellow-500" />}
            title="Compete & Win"
            description="Climb the leaderboards and compete with learners worldwide. Prove you're the best language learner!"
          />
          <FeatureCard
            icon={<Target className="w-8 h-8 text-green-500" />}
            title="Daily Quests"
            description="Complete daily quests for bonus XP and gems. New challenges every day keep learning fresh and exciting."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-blue-500" />}
            title="Spaced Repetition"
            description="Our smart algorithm ensures you review content at the perfect time for maximum retention."
          />
          <FeatureCard
            icon={<Globe className="w-8 h-8 text-purple-500" />}
            title="Multiple Languages"
            description="Choose from 10+ languages including Spanish, French, German, Japanese, and more. Start with one, master them all!"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-primary-600 rounded-2xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of learners mastering new languages every day.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              Get Started Now - It's Free!
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600 border-t">
        <p>&copy; 2024 LinguaQuest. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
