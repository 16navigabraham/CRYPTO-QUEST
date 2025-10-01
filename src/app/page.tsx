'use client';

import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { LogIn, Loader2, Gamepad2, TrendingUp, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FollowMePopup } from '@/components/FollowMePopup';
import { cn } from '@/lib/utils';

const ScrollProgressBar = () => {
    const [width, setWidth] = useState(0);

    const handleScroll = () => {
        const scrollY = window.scrollY;
        const scrollHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercentage = (scrollY / scrollHeight) * 100;
        setWidth(scrollPercentage);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div 
            className="fixed top-0 left-0 z-50 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
            style={{ width: `${width}%` }}
        />
    );
};

const Logo = () => (
    <div className="flex items-center justify-center gap-2">
      <h1 className="font-logo text-5xl tracking-wider text-primary">CryptoQuest</h1>
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

const AnimatedHeroBackground = ({ scrollY }: { scrollY: number }) => {
    return (
      <div 
        className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10"
        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
      >
        <div className="absolute inset-0 bg-background">
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,191,255,0.3),rgba(255,255,255,0))]"
          />
        </div>
      </div>
    );
};

const features = [
    {
        icon: Gamepad2,
        title: "Gamified Learning",
        description: "Interactive quizzes across various topics make learning enjoyable and effective."
    },
    {
        icon: TrendingUp,
        title: "Progressive Difficulty",
        description: "From beginner to master, our tiered system grows with you."
    },
    {
        icon: Trophy,
        title: "Track Your Growth",
        description: "See your scores, track progress, and climb the leaderboards."
    }
]

export default function LandingPage() {
  const { ready, authenticated, login, isNotifying } = usePrivy();
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/home');
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const disabled = !ready || isNotifying || (ready && authenticated);

  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <ScrollProgressBar />
      <AnimatedHeroBackground scrollY={scrollY} />
      <FollowMePopup />
      <header className="flex justify-between items-center p-4 sm:p-6">
        <Logo />
        <Button onClick={login} disabled={disabled} size="lg" className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transform transition-all duration-300 hover:-translate-y-px">
            {disabled ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
            Login / Sign Up
        </Button>
      </header>

      <section className="flex-grow flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 text-left">
                <div className="min-h-[100px] sm:min-h-[120px] flex flex-col justify-center">
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                      Master Web3 Development,
                    </h2>
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary">
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
            <div 
              className="relative h-64 md:h-96"
              style={{ transform: `translateY(${scrollY * -0.2}px)` }}
            >
                 <img
                    src="/cat.jpg"
                    alt="A heroic cartoon cat wearing glasses, ready for a coding quest."
                    width={1200}
                    height={675}
                    className="object-cover rounded-3xl shadow-2xl shadow-primary/20 animate-float"
                    style={{animationDuration: '10s'}}
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
                  {features.map((feature, index) => (
                    <div key={index} className="group text-center p-6 bg-card rounded-xl shadow-sm border border-transparent hover:border-primary/50 hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 rounded-full bg-primary/10">
                                <feature.icon className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
                            </div>
                        </div>
                        <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                        <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
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
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq, index) => (
                        <AccordionItem 
                            value={`item-${index}`} 
                            key={index}
                            className={cn(
                                "bg-muted/30 rounded-lg border border-border/50 transition-all duration-300",
                                "hover:border-primary/50 hover:bg-muted/50",
                                "data-[state=open]:border-primary/50 data-[state=open]:bg-muted/50 data-[state=open]:shadow-lg data-[state=open]:shadow-primary/10"
                            )}
                        >
                            <AccordionTrigger className="text-lg font-semibold px-6 hover:no-underline">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground px-6">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
      </section>

       <footer className="p-6 bg-muted/30 border-t border-primary/20">
          <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">Sharpen your skills. Earn rewards. Become a legend.</p>
             <div className="flex items-center gap-4">
                <a href="https://x.com/AbrahamNAVIG1" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                    <XIcon className="h-5 w-5" />
                    <span className="sr-only">X/Twitter Profile</span>
                </a>
                <a href="https://farcaster.xyz/abrahamnavig" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                    <FarcasterIcon className="h-5 w-5" />
                    <span className="sr-only">Farcaster Profile</span>
                </a>
             </div>
          </div>
        </footer>
    </main>
  );
}
