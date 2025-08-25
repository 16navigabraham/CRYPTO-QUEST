'use client';

import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { Star, LogIn, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Logo = () => (
  <div className="flex items-center justify-center gap-2">
    <Star className="h-8 w-8 text-primary" />
    <h1 className="text-3xl font-bold tracking-tight text-foreground">CryptoQuest</h1>
  </div>
);

export default function LandingPage() {
  const { ready, authenticated, login, isNotifying } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/home');
    }
  }, [ready, authenticated, router]);

  const disabled = !ready || isNotifying || (ready && authenticated);

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="flex justify-between items-center p-4 sm:p-6">
        <Logo />
        <Button onClick={login} variant="outline" disabled={disabled}>
            {(isNotifying || (ready && authenticated)) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <LogIn className="mr-2 h-4 w-4" />
            Login / Sign Up
        </Button>
      </header>

      <section className="flex-grow flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 text-left">
                 <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                    Master Web3 Development,
                    <span className="block text-primary">One Quest at a Time.</span>
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground">
                    CryptoQuest is a gamified learning platform that makes mastering complex blockchain concepts fun and interactive. Take quizzes, earn points, and become a Web3 expert.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={login} size="lg" disabled={disabled}>
                         {(isNotifying || (ready && authenticated)) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Start Your Quest
                    </Button>
                     <Button asChild size="lg" variant="secondary">
                        <Link href="/learn-more">Learn More</Link>
                    </Button>
                </div>
            </div>
            <div className="relative h-64 md:h-96">
                 <Image
                    src="/cat.jpg"
                    alt="CryptoQuest Hero Image"
                    fill
                    className="object-cover rounded-xl shadow-2xl"
                    data-ai-hint="cartoon cat"
                  />
            </div>
        </div>
      </section>

      <section id="features" className="py-16 sm:py-24 bg-muted/50">
          <div className="container mx-auto px-4">
              <div className="text-center space-y-3 mb-12">
                   <h3 className="text-3xl sm:text-4xl font-bold">Why CryptoQuest?</h3>
                   <p className="text-lg text-muted-foreground max-w-2xl mx-auto">An engaging and effective way to level up your developer skills.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center p-6 bg-card rounded-xl shadow-sm">
                      <h4 className="text-xl font-semibold mb-2">Gamified Learning</h4>
                      <p className="text-muted-foreground">Interactive quizzes across various topics make learning enjoyable and effective.</p>
                  </div>
                  <div className="text-center p-6 bg-card rounded-xl shadow-sm">
                      <h4 className="text-xl font-semibold mb-2">Progressive Difficulty</h4>
                      <p className="text-muted-foreground">From beginner to master, our tiered system grows with you.</p>
                  </div>
                   <div className="text-center p-6 bg-card rounded-xl shadow-sm">
                      <h4 className="text-xl font-semibold mb-2">Track Your Growth</h4>
                      <p className="text-muted-foreground">See your scores, track progress, and climb the leaderboards.</p>
                  </div>
              </div>
          </div>
      </section>

       <footer className="text-center p-6 bg-background">
          <p className="text-sm text-muted-foreground">Sharpen your skills. Earn rewards. Become a legend.</p>
        </footer>
    </main>
  );
}
