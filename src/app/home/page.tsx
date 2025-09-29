

'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Feather, Flame, Swords, BrainCircuit, Trophy, Star, LogOut, Loader2, BarChart3, Wallet, Gift, User as UserIcon, Bitcoin, Sparkles, HandCoins, ShieldCheck, ShieldOff, Lock } from 'lucide-react';
import type { SVGProps } from 'react';
import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getContractRewardPool, getUserProfile, getTotalRewardsDistributed, isUserWhitelisted, getUserQuizHistory } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils';
import { FollowMePopup } from '@/components/FollowMePopup';

type Difficulty = {
  name: string;
  description: string;
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  href: string;
}

const difficultyLevels: Difficulty[] = [
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

const EthereumIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
        <path fill="currentColor" d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z" />
    </svg>
);


const FloatingSymbols = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden">
        <Sparkles className="absolute top-[5%] left-[10%] h-8 w-8 text-primary/10 animate-float" style={{ animationDelay: '0s', animationDuration: '10s' }} />
        <Bitcoin className="absolute top-[20%] right-[5%] h-12 w-12 text-primary/10 animate-float" style={{ animationDelay: '2s', animationDuration: '12s' }} />
        <Star className="absolute bottom-[10%] left-[15%] h-6 w-6 text-primary/10 animate-float" style={{ animationDelay: '4s', animationDuration: '8s' }} />
        <Feather className="absolute bottom-[25%] right-[10%] h-10 w-10 text-primary/10 animate-float" style={{ animationDelay: '6s', animationDuration: '11s' }} />
        <Trophy className="absolute top-[50%] left-[2%] h-10 w-10 text-primary/10 animate-float" style={{ animationDelay: '3s', animationDuration: '9s' }} />
        <Sparkles className="absolute bottom-[5%] right-[2%] h-8 w-8 text-primary/10 animate-float" style={{ animationDelay: '1s', animationDuration: '13s' }} />
        <EthereumIcon className="absolute top-[60%] right-[15%] h-10 w-10 text-primary/10 animate-float" style={{ animationDelay: '5s', animationDuration: '15s' }} />
        <EthereumIcon className="absolute top-[15%] left-[30%] h-6 w-6 text-primary/10 animate-float" style={{ animationDelay: '7s', animationDuration: '10s' }} />
    </div>
);

const RewardPool = () => {
    const [rewardPool, setRewardPool] = useState<{ balance: string; symbol: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRewardPool = async () => {
            setLoading(true);
            try {
                const pool = await getContractRewardPool();
                setRewardPool(pool);
            } catch (error) {
                console.error("Failed to fetch reward pool", error);
                setRewardPool({ balance: '0', symbol: 'Tokens' });
            } finally {
                setLoading(false);
            }
        };
        fetchRewardPool();
    }, []);

    return (
        <Card className="bg-primary/10 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reward Pool</CardTitle>
                <Gift className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/4 mt-1" />
                    </>
                ) : (
                    <>
                        <div className="text-2xl font-bold">
                             {rewardPool ? parseFloat(rewardPool.balance).toLocaleString('en-US', {maximumFractionDigits: 2}) : '0'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {rewardPool?.symbol} available for skilled players
                        </p>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

const TotalRewardsDistributed = () => {
    const [distributed, setDistributed] = useState<{ balance: string; symbol: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDistributed = async () => {
            setLoading(true);
            try {
                const data = await getTotalRewardsDistributed();
                setDistributed(data);
            } catch (error) {
                console.error("Failed to fetch total rewards distributed", error);
                setDistributed({ balance: '0', symbol: 'Tokens' });
            } finally {
                setLoading(false);
            }
        };
        fetchDistributed();
    }, []);

    return (
        <Card className="bg-secondary/10 border-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rewards Distributed</CardTitle>
                <HandCoins className="h-5 w-5 text-secondary" />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/4 mt-1" />
                    </>
                ) : (
                    <>
                        <div className="text-2xl font-bold">
                            {distributed ? parseFloat(distributed.balance).toLocaleString('en-US', {maximumFractionDigits: 2}) : '0'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {distributed?.symbol} claimed by users
                        </p>
                    </>
                )}
            </CardContent>
        </Card>
    );
};


type UserProfile = {
  username: string;
  profilePictureUrl: string | null;
  totalScore: number;
}

const WelcomeHeader = () => {
    const { user } = usePrivy();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isWhitelisted, setIsWhitelisted] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileAndWhitelistStatus = async () => {
            if (user?.wallet?.address) {
                if (loading) { // Only set loading on the initial fetch
                    setLoading(true);
                }
                try {
                    const [userProfile, whitelisted] = await Promise.all([
                        getUserProfile(user.wallet.address),
                        isUserWhitelisted(user.wallet.address as `0x${string}`)
                    ]);
                    
                    if (userProfile && userProfile.data) {
                        setProfile(userProfile.data);
                    }
                    setIsWhitelisted(whitelisted);

                } catch (error) {
                    console.error("Failed to fetch user data", error);
                } finally {
                    if (loading) {
                        setLoading(false);
                    }
                }
            }
        }
        fetchProfileAndWhitelistStatus();
    }, [user, loading]);

    if (loading) {
        return (
             <Card>
                <CardContent className="p-4 sm:p-6">
                     <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-32 sm:w-40" />
                            <Skeleton className="h-4 w-24 sm:w-32" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!profile) {
        return null;
    }

    return (
        <Card className="shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
            <CardContent className="p-4 sm:p-6">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-primary">
                            <AvatarImage src={profile.profilePictureUrl || undefined} />
                            <AvatarFallback>{profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl sm:text-2xl font-bold">Welcome, {profile.username}!</h2>
                                {isWhitelisted !== null && (
                                    isWhitelisted ? (
                                         <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <ShieldCheck className="h-6 w-6 text-green-500" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>You are verified to claim rewards!</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ) : (
                                         <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <ShieldOff className="h-6 w-6 text-destructive" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Admin needs to whitelist your Address to be verified and claim rewards</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )
                                )}
                            </div>
                            <p className="text-sm sm:text-base text-muted-foreground">Ready for your next challenge?</p>
                        </div>
                    </div>
                     <div className="text-right flex-shrink-0">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Score</p>
                        <p className="text-2xl sm:text-3xl font-bold text-primary">{profile.totalScore || 0}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

const CooldownTimer = ({ unlockTime }: { unlockTime: number }) => {
    const [timeLeft, setTimeLeft] = useState(unlockTime - Date.now());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(unlockTime - Date.now());
        }, 1000);
        return () => clearInterval(timer);
    }, [unlockTime]);

    if (timeLeft <= 0) return null;

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return (
        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center text-center p-4 rounded-lg">
            <Lock className="h-10 w-10 text-foreground mb-2" />
            <p className="font-bold text-lg">Challenge Locked</p>
            <p className="text-sm text-muted-foreground">Available again in:</p>
            <p className="text-xl font-mono font-semibold">
                {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </p>
        </div>
    );
};

const DifficultyCard = ({ level, lastAttemptTime }: { level: Difficulty; lastAttemptTime: number | null }) => {
    const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours
    const now = Date.now();
    
    let isLocked = false;
    let unlockTime = 0;

    if (lastAttemptTime) {
        unlockTime = lastAttemptTime + cooldownPeriod;
        if (now < unlockTime) {
            isLocked = true;
        }
    }
    
    const Wrapper = isLocked ? 'div' : Link;
    
    return (
        <Wrapper href={isLocked ? '#' : level.href} className={cn(
            "group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background block relative",
            isLocked && "cursor-not-allowed opacity-50"
        )}>
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
            {isLocked && <CooldownTimer unlockTime={unlockTime} />}
        </Wrapper>
    );
};

export default function HomePage() {
  const { ready, authenticated, logout, user } = usePrivy();
  const router = useRouter();
  const [lastAttemptTimes, setLastAttemptTimes] = useState<Record<string, number | null>>({});
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

   useEffect(() => {
        const fetchHistory = async () => {
            if (user?.wallet?.address) {
                setIsHistoryLoading(true);
                try {
                    const historyData = await getUserQuizHistory(user.wallet.address);
                    if (historyData && historyData.data && historyData.data.history) {
                        const newLastAttemptTimes: Record<string, number | null> = {};
                        difficultyLevels.forEach(level => {
                            const lastAttempt = historyData.data.history
                                .filter((h: any) => h.difficulty.toLowerCase() === level.name.toLowerCase())
                                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                            
                            newLastAttemptTimes[level.name.toLowerCase()] = lastAttempt ? new Date(lastAttempt.createdAt).getTime() : null;
                        });
                        setLastAttemptTimes(newLastAttemptTimes);
                    }
                } catch (error) {
                    console.error("Failed to fetch quiz history for cooldowns:", error);
                } finally {
                    setIsHistoryLoading(false);
                }
            } else {
                setIsHistoryLoading(false);
            }
        };

        if (ready && authenticated) {
            fetchHistory();
        }
    }, [user, ready, authenticated]);


  if (!ready || !authenticated) {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying authentication...</p>
      </div>
    );
  }
  
  return (
    <main className="relative flex min-h-screen flex-col items-center bg-background p-4 sm:p-6 md:p-8">
      <FollowMePopup />
      <FloatingSymbols />
      <div className="w-full max-w-5xl space-y-8">
        <header className="flex justify-between items-center w-full gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground" style={{ textShadow: '1px 1px 0px hsl(var(--primary)), 2px 2px 0px hsl(var(--primary)), 3px 3px 0px hsl(var(--primary)), 4px 4px 0px hsl(var(--primary))' }}>CryptoQuest</h1>
            </div>
           <div className="flex items-center gap-1 sm:gap-2">
             <ThemeSwitcher />
             <Button onClick={() => router.push('/profile/setup')} variant="outline" size="sm" className="p-2 sm:px-3">
                <UserIcon className="h-4 w-4" /> 
                <span className="hidden sm:inline ml-2">Profile</span>
            </Button>
             <Button onClick={() => router.push('/wallet')} variant="outline" size="sm" className="p-2 sm:px-3">
                <Wallet className="h-4 w-4" /> 
                <span className="hidden sm:inline ml-2">Wallet</span>
            </Button>
            <Button onClick={() => router.push('/leaderboard')} variant="outline" size="sm" className="p-2 sm:px-3">
                <BarChart3 className="h-4 w-4" /> 
                <span className="hidden sm:inline ml-2">Board</span>
            </Button>
            <Button onClick={logout} variant="outline" size="sm" className="p-2 sm:px-3">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Logout</span>
            </Button>
          </div>
        </header>

        <WelcomeHeader />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RewardPool />
          <TotalRewardsDistributed />
        </div>

        <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Choose Your Challenge</h2>
            <p className="text-muted-foreground text-md sm:text-lg max-w-2xl mx-auto mt-2">
                Test your crypto development knowledge across various topics and difficulty levels.
            </p>
        </div>
        
        <Carousel
            opts={{
                align: "start",
                loop: false,
            }}
            className="w-full"
            >
            <CarouselContent className="-ml-2 md:-ml-4">
                {difficultyLevels.map((level, index) => (
                <CarouselItem key={index} className="basis-4/5 sm:basis-1/2 lg:basis-1/3 pl-2 md:pl-4">
                    <div className="p-1">
                        {isHistoryLoading ? (
                             <Card className="h-full">
                                <CardHeader className="flex flex-col items-center text-center space-y-4 p-6">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-24" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                </CardHeader>
                             </Card>
                        ) : (
                           <DifficultyCard 
                                level={level}
                                lastAttemptTime={lastAttemptTimes[level.name.toLowerCase()]}
                           />
                        )}
                    </div>
                </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
        </Carousel>
        
        <footer className="text-center text-sm text-muted-foreground pt-4">
          <p>Sharpen your skills. Earn rewards. Become a legend.</p>
        </footer>
      </div>
    </main>
  );
}

    

    
