import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Feather, Flame, Swords, BrainCircuit, Trophy, Star } from 'lucide-react';
import type { SVGProps } from 'react';

const Logo = () => (
  <div className="flex items-center justify-center gap-2">
    <Star className="h-8 w-8 text-primary" />
    <h1 className="text-3xl font-bold tracking-tight text-foreground">CryptoQuest</h1>
  </div>
);

const difficultyLevels = [
  {
    name: 'Beginner',
    description: 'Start your journey. Basic concepts and syntax.',
    icon: (props: SVGProps<SVGSVGElement>) => <Feather {...props} />,
    href: '/quiz/beginner',
  },
  {
    name: 'Intermediate',
    description: 'Build on your knowledge. Common patterns and practices.',
    icon: (props: SVGProps<SVGSVGElement>) => <Flame {...props} />,
    href: '/quiz/intermediate',
  },
  {
    name: 'Advanced',
    description: 'Tackle complex topics. Advanced mechanics and optimization.',
    icon: (props: SVGProps<SVGSVGElement>) => <Swords {...props} />,
    href: '/quiz/advanced',
  },
  {
    name: 'Expert',
    description: 'Push your limits. In-depth, niche topics.',
    icon: (props: SVGProps<SVGSVGElement>) => <BrainCircuit {...props} />,
    href: '/quiz/expert',
  },
  {
    name: 'Master',
    description: 'For the true masters. The ultimate challenge.',
    icon: (props: SVGProps<SVGSVGElement>) => <Trophy {...props} />,
    href: '/quiz/master',
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-4xl space-y-10">
        <header className="text-center space-y-3">
          <Logo />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Test your crypto development knowledge across various topics and difficulty levels. Choose your challenge below to begin your quest!
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {difficultyLevels.map((level) => (
            <Link href={level.href} key={level.name} className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              <Card className="h-full transform transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-primary/20 group-focus-visible:-translate-y-1 group-focus-visible:shadow-2xl group-focus-visible:shadow-primary/20">
                <CardHeader className="flex flex-col items-center text-center space-y-4 p-6">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <level.icon className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{level.name}</CardTitle>
                    <CardDescription>{level.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
        <footer className="text-center text-sm text-muted-foreground">
          <p>Sharpen your skills. Earn rewards. Become a legend.</p>
        </footer>
      </div>
    </main>
  );
}
