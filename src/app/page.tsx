'use client';

import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { LogIn, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FollowMePopup } from '@/components/FollowMePopup';

const Logo = () => (
  <div className="flex items-center justify-center gap-2">
    <h1 className="font-logo text-4xl">CryptoQuest</h1>
  </div>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      {...props}
    >
      <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z" />
    </svg>
  );

const FarcasterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M18.999 3h-14a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-1.5 6h-4v2h4a1 1 0 0 1 0 2h-4v2h4a3 3 0 1 1-3 3h-1a.999.999 0 0 1-1-1v-4a1 1 0 0 1 1-1h4V9h-4a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h1a5 5 0 1 0 0-10Z" />
    </svg>
);

const faqs = [
    {
        question: "What is CryptoQuest?",
        answer: "CryptoQuest is a gamified learning platform designed to make mastering complex blockchain and Web3 development concepts fun and interactive. Take quizzes, earn points, and become a Web3 expert."
    },
    {
        question: "Who is this platform for?",
        answer: "CryptoQuest is built for developers of all skill levels—from complete beginners curious about blockchain to seasoned professionals looking to sharpen their skills on advanced topics."
    },
    {
        question: "How do I earn rewards?",
        answer: "By successfully completing quizzes, you earn points and can claim on-chain rewards in the form of our native token. The better you perform, the more you can earn."
    },
    {
        question: "Is this free to use?",
        answer: "Yes, CryptoQuest is completely free to use. You can sign up, take quizzes, and learn without any cost. You only need a small amount of cryptocurrency for gas fees if you choose to claim your rewards on-chain."
    }
]

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
      <FollowMePopup />
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
                <div className="min-h-[100px] sm:min-h-[120px] flex flex-col justify-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                      Master Web3 Development,
                    </h2>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary">
                      One Quest at a Time.
                    </h2>
                </div>

                <p className="text-lg sm:text-xl text-muted-foreground">
                    CryptoQuest is a gamified learning platform that makes mastering complex blockchain concepts fun and interactive. Take quizzes, earn points, and become a Web3 expert.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                     <Button asChild size="lg" variant="secondary">
                        <Link href="/learn-more">Learn More</Link>
                    </Button>
                </div>
            </div>
            <div className="relative h-64 md:h-96">
                 <Image
                    src="/cat.jpg"
                    alt="A heroic cartoon cat wearing glasses, ready for a coding quest."
                    width={1200}
                    height={675}
                    className="object-cover rounded-xl shadow-2xl"
                    data-ai-hint="cartoon cat"
                    priority
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

      <section id="faq" className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
            <div className="text-center space-y-3 mb-12">
                <h3 className="text-3xl sm:text-4xl font-bold">Frequently Asked Questions</h3>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Have questions? We've got answers.
                </p>
            </div>
            <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-lg font-semibold">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
      </section>

       <footer className="text-center p-6 bg-background">
          <div className="flex justify-center items-center gap-4">
            <p className="text-sm text-muted-foreground">Sharpen your skills. Earn rewards. Become a legend.</p>
             <a href="https://x.com/AbrahamNAVIG1" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <XIcon className="h-5 w-5" />
                <span className="sr-only">X/Twitter Profile</span>
            </a>
             <a href="https://farcaster.xyz/abrahamnavig" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <FarcasterIcon className="h-5 w-5" />
                <span className="sr-only">Farcaster Profile</span>
            </a>
          </div>
        </footer>
    </main>
  );
}
