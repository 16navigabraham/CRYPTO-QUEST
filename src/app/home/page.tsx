'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Feather, Flame, Swords, BrainCircuit, Trophy, Star, LogOut, Loader2, BarChart3, Wallet, Gift, User as UserIcon } from 'lucide-react';
import type { SVGProps } from 'react';
import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getContractRewardPool, getUserProfile } from '../actions';
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
                            {rewardPool ? parseFloat(rewardPool.balance).toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0'}
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

type UserProfile = {
  username: string;
  profilePictureUrl: string | null;
  totalScore: number;
}

const WelcomeHeader = () => {
    const { user } = usePrivy();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.wallet?.address) {
                try {
                    const userProfile = await getUserProfile(user.wallet.address);
                    if (userProfile && userProfile.data) {
                        setProfile(userProfile.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch user profile", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [user]);

    if (loading) {
        return (
             <Card>
                <CardContent className="p-6">
                     <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-32" />
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
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary">
                            <AvatarImage src={profile.profilePictureUrl || undefined} />
                            <AvatarFallback>{profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-2xl font-bold">Welcome back, {profile.username}!</h2>
                            <p className="text-muted-foreground">Ready for your next challenge?</p>
                        </div>
                    </div>
                     <div className="text-right">
                        <p className="text-sm font-medium text-muted-foreground">Total Score</p>
                        <p className="text-3xl font-bold text-primary">{profile.totalScore || 0}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function HomePage() {
  const { ready, authenticated, logout } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  if (!ready || !authenticated) {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying authentication...</p>
      </div>
    );
  }
  
  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-5xl space-y-8">
        <header className="flex justify-between items-center w-full gap-4">
            <div className="flex items-center gap-2">
                <Star className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">CryptoQuest</h1>
            </div>
           <div className="flex items-center gap-2">
             <ThemeSwitcher />
             <Button onClick={() => router.push('/profile/setup')} variant="outline" size="sm">
                <UserIcon /> Profile
            </Button>
             <Button onClick={() => router.push('/wallet')} variant="outline" size="sm">
                <Wallet /> Wallet
            </Button>
            <Button onClick={() => router.push('/leaderboard')} variant="outline" size="sm">
                <BarChart3 /> Leaderboard
            </Button>
            <Button onClick={logout} variant="outline" size="sm">
              <LogOut /> Logout
            </Button>
          </div>
        </header>

        <WelcomeHeader />
        
        <RewardPool />

        <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Choose Your Challenge</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-2">
                Test your crypto development knowledge across various topics and difficulty levels.
            </p>
        </div>
        
        <Carousel
            opts={{
                align: "start",
                loop: true,
            }}
            className="w-full"
            >
            <CarouselContent>
                {difficultyLevels.map((level, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                        <Link 
                            href={level.href} 
                            className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background block"
                        >
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
                    </div>
                </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
        </Carousel>
        
        <footer className="text-center text-sm text-muted-foreground">
          <p>Sharpen your skills. Earn rewards. Become a legend.</p>
        </footer>
      </div>
    </main>
  );
}
