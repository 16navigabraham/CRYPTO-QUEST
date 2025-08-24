
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


const placeholderPlayers = [
  { rank: 1, name: 'Satoshi', score: 10000, avatar: '/avatars/1.png' },
  { rank: 2, name: 'Vitalik', score: 9500, avatar: '/avatars/2.png' },
  { rank: 3, name: 'Gavin', score: 9000, avatar: '/avatars/3.png' },
  { rank: 4, name: 'Charles', score: 8500, avatar: '/avatars/4.png' },
  { rank: 5, name: 'Anatoly', score: 8000, avatar: '/avatars/5.png' },
  { rank: 6, name: 'Silvio', score: 7500, avatar: '/avatars/6.png' },
  { rank: 7, name: 'Sergey', score: 7000, avatar: '/avatars/7.png' },
  { rank: 8, name: 'Rune', score: 6500, avatar: '/avatars/8.png' },
  { rank: 9, name: 'Stani', score: 6000, avatar: '/avatars/9.png' },
  { rank: 10, name: 'Hayden', score: 5500, avatar: '/avatars/10.png' },
];

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


export default function LeaderboardPage() {
  const topThree = placeholderPlayers.slice(0, 3);
  const restOfPlayers = placeholderPlayers.slice(3);

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
              {topThree.map((player, index) => (
                <Card key={player.rank} className={cn("text-center p-4 transform transition-transform hover:-translate-y-1", getRankColor(player.rank))}>
                  <div className="flex flex-col items-center gap-2">
                    <div className="mb-2">{getRankIcon(player.rank)}</div>
                     <Avatar className="h-20 w-20 border-2 border-primary">
                      <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="avatar" />
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
                           <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="avatar" />
                           <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
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
