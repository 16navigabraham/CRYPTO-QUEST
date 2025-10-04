
'use client';

import { ArrowLeft, Crown, Medal, Trophy } from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useEffect, useState, useRef } from 'react';
import { getLeaderboard } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


type Player = {
    rank: number;
    name: string;
    score: number;
    avatar: string | null;
}

const AnimatedNumber = ({ value }: { value: number }) => {
    const [currentValue, setCurrentValue] = useState(0);
    const targetValue = value;
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        const start = performance.now();
        const duration = 1500; // Animation duration in ms

        const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

            const nextValue = Math.floor(easedProgress * targetValue);
            setCurrentValue(nextValue);

            if (progress < 1) {
                animationFrameId.current = requestAnimationFrame(animate);
            } else {
                setCurrentValue(targetValue);
            }
        };

        animationFrameId.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [targetValue]);

    return <span>{currentValue.toLocaleString()}</span>;
};

const RankTooltipContent = ({ player, maxScore = 5000 }: { player: Player; maxScore?: number }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">Score</span>
            <span className="text-xs font-bold">{player.score.toLocaleString()} / {maxScore.toLocaleString()}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-progress-fill"
                style={{ '--progress-width': `${(player.score / maxScore) * 100}%` } as React.CSSProperties}
            />
        </div>
        <p className="text-xs text-slate-400 text-center">Keep going!</p>
    </div>
);


const getRankIcon = (player: Player) => {
    const rank = player.rank;
    let icon;
    let rankClass = "text-lg font-bold text-white/90";
    let shadowColor = 'rgba(255, 255, 255, 0.4)';

    if (rank === 1) {
        icon = <Crown className="h-8 w-8 text-yellow-400" />;
        rankClass = "text-4xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent";
        shadowColor = 'rgba(234, 179, 8, 0.7)';
    } else if (rank === 2) {
        icon = <Medal className="h-8 w-8 text-slate-300" />;
        rankClass = "text-4xl font-extrabold bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text text-transparent";
        shadowColor = 'rgba(203, 213, 225, 0.7)';
    } else if (rank === 3) {
        icon = <Trophy className="h-8 w-8 text-orange-400" />;
        rankClass = "text-4xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent";
        shadowColor = 'rgba(202, 138, 4, 0.7)';
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="relative group">
                         {icon ? (
                            <div className="animate-float-slow" style={{ filter: `drop-shadow(0 0 10px ${shadowColor})` }}>
                                {icon}
                            </div>
                        ) : (
                            <span className={rankClass} style={{ filter: `drop-shadow(0 0 5px ${shadowColor})` }}>
                                {rank}
                            </span>
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-950/90 backdrop-blur-lg border-blue-500/30 text-white rounded-xl shadow-2xl shadow-black/50">
                    <RankTooltipContent player={player} />
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

const getRankColor = (rank: number) => {
    if(rank === 1) return "border-yellow-400/50";
    if(rank === 2) return "border-slate-400/50";
    if(rank === 3) return "border-orange-500/50";
    return "border-primary/30";
}

const getPodiumClass = (rank: number) => {
    switch (rank) {
        case 1:
            return "z-30 scale-110";
        case 2:
            return "z-20";
        case 3:
            return "z-10";
        default:
            return "z-0";
    }
}


const LeaderboardSkeleton = () => (
    <div className="w-full max-w-4xl">
        <Card className="bg-card/10 backdrop-blur-lg border-primary/20 shadow-2xl shadow-primary/10">
            <CardHeader className="text-center">
                <Skeleton className="h-8 w-1/2 mx-auto" />
                <Skeleton className="h-4 w-3/4 mx-auto mt-2" />
            </CardHeader>
            <CardContent>
                <div className="relative flex items-end justify-center gap-2 sm:gap-4 mb-12 min-h-[320px]">
                    {[2, 1, 3].map((rank) => (
                         <div key={rank} className={cn("w-1/3", getPodiumClass(rank), rank === 1 && "-translate-y-5")}>
                            <Card className={cn("text-center p-4 rounded-2xl bg-blue-900/10 backdrop-blur-xl border", getRankColor(rank))}>
                                <div className="flex flex-col items-center gap-2">
                                    <Skeleton className="h-10 w-8 mb-2" />
                                    <Skeleton className="h-20 w-20 rounded-full" />
                                    <Skeleton className="h-6 w-24 mt-2" />
                                    <Skeleton className="h-8 w-32 mt-1" />
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10">
                            <TableHead className="w-[80px]"><Skeleton className="h-5 w-12"/></TableHead>
                            <TableHead><Skeleton className="h-5 w-24"/></TableHead>
                            <TableHead className="text-right"><Skeleton className="h-5 w-16 ml-auto"/></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(7)].map((_, i) => (
                            <TableRow key={i} className="border-white/10">
                                <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <Skeleton className="h-5 w-32" />
                                    </div>
                                </TableCell>
                                <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
);


const AvatarGlow = ({ src, name }: { src: string | null; name: string }) => (
  <div className="relative group">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-spin" style={{ animationDuration: '3s' }}></div>
    <Avatar className="h-20 w-20 relative border-2 border-background">
      <AvatarImage src={src || ''} data-ai-hint="avatar" />
      <AvatarFallback>{name.charAt(0)}</AvatarFallback>
    </Avatar>
  </div>
);


export default function LeaderboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const leaderboardData = await getLeaderboard();
        const formattedData = leaderboardData.map((p: any) => ({
            rank: p.rank,
            name: p.username || `User...${p.walletAddress.substring(p.walletAddress.length - 4)}`,
            score: p.score,
            avatar: p.profilePictureUrl,
        }));
        setPlayers(formattedData);
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const AnimatedWaves = () => (
    <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div 
            className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_70%)] animate-wave"
            style={{ animationDelay: '0s', animationDuration: '15s' }}
        />
        <div 
            className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_70%)] animate-wave"
            style={{ animationDelay: '-5s', animationDuration: '20s' }}
        />
        <div 
            className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_70%)] animate-wave"
            style={{ animationDelay: '-10s', animationDuration: '25s' }}
        />
    </div>
  );


  if (loading) {
      return (
         <div className="relative flex min-h-screen flex-col items-center bg-gradient-to-br from-[#0a1628] via-[#1e3a8a] to-[#0c4a6e] p-4 sm:p-8">
            <AnimatedWaves />
            <div className="w-full max-w-4xl z-10">
                 <Button asChild variant="ghost" className="mb-4 text-white/80 hover:text-white hover:bg-white/10 invisible">
                    <Link href="/home">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
                <LeaderboardSkeleton />
            </div>
        </div>
      );
  }

  const topThree = players.slice(0, 3);
  const restOfPlayers = players.slice(3);

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#0a1628] via-[#1e3a8a] to-[#0c4a6e] p-4 sm:p-8 flex flex-col items-center">
      <AnimatedWaves />
      <div className="w-full max-w-4xl z-10">
        <div style={{ animation: 'fade-in-slide-up 0.5s ease-out forwards', opacity: 0 }}>
            <Button asChild variant="ghost" className="mb-4 text-white/80 hover:text-white hover:bg-white/10">
                <Link href="/home">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
        </div>
        <div style={{ animation: 'fade-in-slide-up 0.6s ease-out forwards', opacity: 0, animationDelay: '0.1s' }}>
            <Card className="bg-slate-900/40 backdrop-blur-2xl border-cyan-400/20 shadow-2xl shadow-cyan-500/10 text-card-foreground rounded-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold tracking-tight text-white/90">Leaderboard</CardTitle>
                <CardDescription className="text-white/70">See who is leading the quest for knowledge!</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Top 3 Players */}
                <div 
                    className="relative flex items-end justify-center gap-2 sm:gap-4 mb-12 min-h-[320px]"
                >
                {topThree.map((player) => (
                    <div 
                    key={player.rank} 
                    className={cn(
                        "w-1/3 transition-all duration-500 ease-in-out",
                        "transform-gpu",
                        player.rank === 1 && "z-10",
                    )}
                    style={{
                        animation: `fade-in-slide-up 0.7s ease-out forwards`,
                        animationDelay: `${0.2 + (player.rank * 0.1)}s`,
                        opacity: 0,
                        transform: `translateY(${player.rank === 1 ? '-20px' : (player.rank === 2 ? '-10px' : '0')}) scale(${player.rank === 1 ? 1.1 : 1})`,
                    }}
                    >
                        <Card 
                        className={cn(
                            "text-center p-4 rounded-2xl transition-all duration-300",
                            "bg-blue-950/50 backdrop-blur-xl border",
                            "hover:-translate-y-2",
                            "hover:shadow-2xl hover:shadow-primary/40",
                            getRankColor(player.rank)
                        )}
                        >
                        <div className="flex flex-col items-center gap-2">
                            <div className="mb-2 h-10 flex items-center justify-center">{getRankIcon(player)}</div>
                            <AvatarGlow src={player.avatar} name={player.name} />
                            <p className="text-xl font-bold text-white/90">{player.name}</p>
                            <div className="font-semibold text-white px-5 py-2 rounded-full bg-gradient-to-r from-blue-700 to-cyan-500 animate-pulse-score">
                            <AnimatedNumber value={player.score} /> Points
                            </div>
                        </div>
                        </Card>
                    </div>
                ))}
                </div>

                {/* Rest of the players table */}
                <div 
                    className="overflow-x-auto"
                    style={{ animation: 'fade-in-slide-up 0.6s ease-out forwards', opacity: 0, animationDelay: '0.5s' }}
                >
                    <Table>
                    <TableHeader>
                        <TableRow className="border-white/10">
                        <TableHead className="w-[80px] pr-0 text-white/80">Rank</TableHead>
                        <TableHead className="text-white/80">Player</TableHead>
                        <TableHead className="text-right text-white/80">Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {restOfPlayers.map(player => (
                        <TableRow key={player.rank} className="group border-white/10 transition-all duration-300 hover:bg-white/5 hover:!scale-[1.02]">
                            <TableCell className="font-bold text-center">{getRankIcon(player)}</TableCell>
                            <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/30">
                                <AvatarImage src={player.avatar || ''} data-ai-hint="avatar" />
                                <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="truncate text-white/80">{player.name}</span>
                            </div>
                            </TableCell>
                            <TableCell className="text-right font-medium text-white/80">
                                <AnimatedNumber value={player.score} /> Points
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
