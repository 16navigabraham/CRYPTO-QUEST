'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Star, Gamepad2, Award, ArrowLeft, BrainCircuit } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: <Gamepad2 className="h-10 w-10 text-primary" />,
    title: 'Gamified Learning Experience',
    description:
      'Say goodbye to boring tutorials. CryptoQuest turns learning into an adventure. Our interactive quizzes are designed to be fun, engaging, and challenging, ensuring you retain what you learn.',
  },
  {
    icon: <BrainCircuit className="h-10 w-10 text-primary" />,
    title: 'Progressive Difficulty Levels',
    description:
      "Whether you're a complete beginner or a seasoned pro, we have a path for you. Start with the basics and climb your way up through five difficulty levels: Beginner, Intermediate, Advanced, Expert, and Master.",
  },
  {
    icon: <Award className="h-10 w-10 text-primary" />,
    title: 'Earn Real Crypto Rewards',
    description:
      'Your knowledge has real value. Pass quizzes to earn points and claim on-chain rewards in the form of our native token. The better you perform, the more you can earn.',
  },
];

const Logo = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      <Star className="h-8 w-8 text-primary" />
      <h1 className="text-3xl font-bold tracking-tight text-foreground">CryptoQuest</h1>
    </div>
  );

export default function LearnMorePage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8">
       <div className="absolute top-4 left-4">
        <Button asChild variant="ghost">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Link>
        </Button>
       </div>

      <div className="w-full max-w-4xl space-y-12 text-center">
        <header className="space-y-4">
          <Logo />
          <h2 className="text-4xl font-extrabold tracking-tight">Level Up Your Web3 Skills</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            CryptoQuest is more than just a learning platform—it's a launchpad for your developer career in the decentralized world. We believe the best way to learn is by doing, in a fun, rewarding, and competitive environment.
          </p>
        </header>

        <section>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="h-full transform transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20">
                <CardHeader className="flex flex-col items-center space-y-4 p-6">
                    <div className="bg-primary/10 p-4 rounded-full">
                        {feature.icon}
                    </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-muted/50 rounded-xl p-8">
            <h3 className="text-3xl font-bold mb-4">Ready to Start Your Quest?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join a community of forward-thinking developers. Sign up today, start learning, and begin your journey to becoming a blockchain master. Your first quest is just a click away.
            </p>
            <Button asChild size="lg">
                <Link href="/register">
                    Sign Up Now
                </Link>
            </Button>
        </section>
      </div>
    </main>
  );
}
