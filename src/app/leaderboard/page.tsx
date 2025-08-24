
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
import { useEffect, useState } from 'react';
import { getLeaderboard } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';

type Player = {
    rank: number;
    name: string;
    score: number;
    avatar: string | null;
}

const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-slate-400" />;
    if (rank === 3) return <Trophy className="h-6 w-6 text-yellow-600" />;
    return <span className="text-lg font-bold">{rank}</span>;
}

const getRankColor = (rank: number) => {
    if(rank === 1) return "border-yellow-400 bg-yellow-400/10";
    if(rank === 2) return "border-slate-400 bg-slate-400/10";
    if(rank === 3) return "border-yellow-600 bg-yellow-600/10";
    return "border-border";
}

const LeaderboardSkeleton = () => (
    <div className="w-full max-w-4xl">
        <Card>
            <CardHeader className="text-center">
                <Skeleton className="h-8 w-1/2 mx-auto" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="text-center p-4">
                            <div className="flex flex-col items-center gap-2">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-20 w-20 rounded-full" />
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-5 w-16" />
                            </div>
                        </Card>
                    ))}
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Rank</TableHead>
                            <TableHead>Player</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(7)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <Skeleton className="h-5 w-32" />
                                    </div>
                                </TableCell>
                                <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
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
        // The API returns 'name' and 'score', which matches our component props.
        const formattedData = leaderboardData.map((p: any) => ({
            rank: p.rank,
            name: p.name || `User ${p.privyDid.substring(0, 6)}`,
            score: p.score,
            avatar: p.avatar,
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

  if (loading) {
      return (
         <div className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8">
            <div className="w-full max-w-4xl">
                 <Button asChild variant="ghost" className="mb-4">
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
    <div className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <Button asChild variant="ghost" className="mb-4">
            <Link href="/home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Link>
        </Button>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">Leaderboard</CardTitle>
            <CardDescription>See who is leading the quest for knowledge!</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Top 3 Players */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {topThree.map((player) => (
                <Card key={player.rank} className={cn("text-center p-4 transform transition-transform hover:-translate-y-1", getRankColor(player.rank))}>
                  <div className="flex flex-col items-center gap-2">
                    <div className="mb-2">{getRankIcon(player.rank)}</div>
                     <Avatar className="h-20 w-20 border-2 border-primary">
                      <AvatarImage src={player.avatar || `https://placehold.co/100x100.png`} data-ai-hint="avatar" />
                      <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="text-xl font-bold">{player.name}</p>
                    <Badge variant="secondary">{player.score} CQP</Badge>
                  </div>
                </Card>
              ))}
            </div>

            {/* Rest of the players table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {restOfPlayers.map(player => (
                  <TableRow key={player.rank}>
                    <TableCell className="font-bold">{player.rank}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                         <Avatar className="h-10 w-10">
                           <AvatarImage src={player.avatar || `https://placehold.co/100x100.png`} data-ai-hint="avatar" />
                           <AvatarFallback>{player.name.charAt(0)}</Fallback>
                        </Avatar>
                        <span>{player.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{player.score} CQP</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
