
'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePrivy, useWallets, useSendTransaction } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { getWalletDetails, getUserQuizHistory } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2, Send, Wallet as WalletIcon, Copy, Check, LogOut, AlertTriangle, Coins, Clock, BookOpen, ExternalLink, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { parseUnits, type Hex } from 'viem';
import { base } from 'viem/chains';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


const sendSchema = z.object({
  recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Amount must be a positive number',
  }),
});

type WalletDetails = {
    rewardToken: {
        balance: string;
        symbol: string;
        decimals: number;
        tokenAddress: `0x${string}`;
        usdValue: string;
    };
    eth: {
        balance: string;
        symbol: string;
        usdValue: string;
    };
}

type QuizHistoryItem = {
    _id: string;
    quizId: string;
    score: number;
    maxScore: number;
    difficulty: string;
    createdAt: string;
    percentage: number;
}

const WalletSkeleton = () => (
    <div className="w-full max-w-lg">
        <Button asChild variant="ghost" className="mb-4 invisible">
            <Link href="/home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Link>
        </Button>
        <Card className="animate-pulse">
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                     <Skeleton className="h-10 w-full" />
                     <Skeleton className="h-12 w-full" />
                </div>
                 <Separator />
                <div className="space-y-4">
                     <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </CardContent>
        </Card>
    </div>
);

const FloatingParticles = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden">
        {[...Array(30)].map((_, i) => {
            const size = Math.random() * 3 + 1;
            const style = {
                width: `${size}px`,
                height: `${size}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 20 + 15}s`,
                animationDelay: `${Math.random() * -30}s`,
            };
            return <div key={i} style={style} className="absolute rounded-full bg-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-float-slow" />;
        })}
    </div>
);

const EthereumIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
        <path fill="currentColor" d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z" />
    </svg>
);


export default function WalletPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { ready, authenticated, exportWallet } = usePrivy();
    const { wallets } = useWallets();
    const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
    const { sendTransaction, isSending } = useSendTransaction();

    const [walletDetails, setWalletDetails] = useState<WalletDetails | null>(null);
    const [history, setHistory] = useState<QuizHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const form = useForm<z.infer<typeof sendSchema>>({
        resolver: zodResolver(sendSchema),
        defaultValues: { recipient: '', amount: '' },
    });

    const fetchWalletData = useCallback(async () => {
        if (embeddedWallet) {
            setIsLoading(true);
            setIsHistoryLoading(true);
            try {
                const [details, historyData] = await Promise.all([
                    getWalletDetails(embeddedWallet.address as `0x${string}`),
                    getUserQuizHistory(embeddedWallet.address)
                ]);
                setWalletDetails(details);
                setHistory(historyData?.data?.history || []);
            } catch (error) {
                console.error("Failed to fetch wallet data:", error);
                 toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Could not fetch your wallet details or history.',
                });
            } finally {
                setIsLoading(false);
                setIsHistoryLoading(false);
            }
        }
    }, [embeddedWallet, toast]);

    useEffect(() => {
        if (ready && !authenticated) {
            router.push('/login');
        }
        if (ready && authenticated && embeddedWallet) {
            fetchWalletData();
        }
    }, [ready, authenticated, router, embeddedWallet, fetchWalletData]);

    const handleCopy = () => {
        if (embeddedWallet?.address) {
            navigator.clipboard.writeText(embeddedWallet.address);
            setCopied(true);
            toast({ title: 'Copied!', description: 'Wallet address copied to clipboard.' });
            setTimeout(() => setCopied(false), 2000);
        }
    };
    
    const onSubmit = async (values: z.infer<typeof sendSchema>>) => {
        if (!embeddedWallet || !walletDetails) {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Wallet is not ready. Please try again.',
            });
            return;
        }

        try {
            await embeddedWallet.switchChain(base.id);
            const amountToSend = parseUnits(values.amount, walletDetails.rewardToken.decimals);
            
            const unsignedTx = {
                to: walletDetails.rewardToken.tokenAddress,
                chainId: base.id,
                data: `0xa9059cbb${values.recipient.substring(2).padStart(64, '0')}${amountToSend.toString(16).padStart(64, '0')}` as Hex,
                value: '0x0'
            };

            const {hash} = await sendTransaction(unsignedTx);

            toast({
                title: 'Transaction Sent!',
                description: 'Your tokens are on their way.',
                 action: (
                    <a href={`https://basescan.org/tx/${hash}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">View on Basescan</Button>
                    </a>
                ),
            });
            form.reset();
            setTimeout(fetchWalletData, 5000); 

        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Transaction Failed',
                description: error.message || 'An unknown error occurred.',
            });
        }
    }


    if (!ready || isLoading) {
        return (
            <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-slate-900 to-blue-950 p-4 sm:p-8">
                <WalletSkeleton />
            </div>
        );
    }
    
    const address = embeddedWallet?.address || '';
    const truncatedAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-gradient-to-br from-slate-900 to-blue-950 p-4 sm:p-8">
      <FloatingParticles />
      <div className="w-full max-w-lg">
        <Button asChild variant="ghost" className="mb-4">
            <Link href="/home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Link>
        </Button>
        <Card className="bg-black/20 backdrop-blur-lg border border-blue-500/30 rounded-2xl shadow-2xl shadow-blue-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <WalletIcon className="h-6 w-6 text-primary" /> Your Wallet
            </CardTitle>
            <CardDescription>View balances, send tokens, and see your transaction history on the Base network.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
                <Card className="bg-muted/30">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <WalletIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">My Wallet</p>
                                <p className="font-mono font-semibold">{truncatedAddress}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleCopy}>
                            {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                        </Button>
                    </CardContent>
                </Card>

                <Tabs defaultValue="assets" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 rounded-lg bg-muted/30 p-1 border-b-0">
                        <TabsTrigger value="assets" className="data-[state=active]:border-blue-500 data-[state=active]:text-blue-500 data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none"><Coins className="mr-2 h-4 w-4" />Assets</TabsTrigger>
                        <TabsTrigger value="send" className="data-[state=active]:border-blue-500 data-[state=active]:text-blue-500 data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none"><Send className="mr-2 h-4 w-4" />Send</TabsTrigger>
                        <TabsTrigger value="history" className="data-[state=active]:border-blue-500 data-[state=active]:text-blue-500 data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none"><Clock className="mr-2 h-4 w-4" />History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="assets" className="mt-4 space-y-4">
                        <Card className="transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50 hover:bg-primary/5">
                           <CardContent className="p-4 flex items-center gap-4">
                                <div className="relative animate-pulse-slow">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-800 to-blue-900 border-2 border-transparent">
                                        <Coins className="h-6 w-6 text-cyan-300" />
                                    </div>
                                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-60 blur-md -z-10" />
                                </div>
                                <div className="flex-grow">
                                    <CardTitle className="text-sm font-medium">Reward Token</CardTitle>
                                    <p className="text-sm text-muted-foreground">{walletDetails?.rewardToken.symbol || 'CQT'}</p>
                                </div>
                                <div className="text-right">
                                    {isLoading ? (
                                        <>
                                            <Skeleton className="h-6 w-20" />
                                            <Skeleton className="h-4 w-16 mt-1" />
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-lg font-bold">
                                                {walletDetails ? parseFloat(walletDetails.rewardToken.balance).toLocaleString('en-US', { maximumFractionDigits: 4 }) : '0.00'}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                ${walletDetails?.rewardToken.usdValue || '0.00'} USD
                                            </p>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/5">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="relative animate-pulse-slow">
                                     <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-transparent">
                                        <EthereumIcon className="h-6 w-6 text-slate-300" />
                                    </div>
                                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-slate-400 to-slate-600 opacity-60 blur-md -z-10" />
                                </div>
                                <div className="flex-grow">
                                    <CardTitle className="text-sm font-medium">Base Ether</CardTitle>
                                     <p className="text-sm text-muted-foreground">ETH</p>
                                </div>
                                <div className="text-right">
                                    {isLoading ? (
                                        <>
                                            <Skeleton className="h-6 w-24" />
                                            <Skeleton className="h-4 w-20 mt-1" />
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-lg font-bold">
                                                {walletDetails ? parseFloat(walletDetails.eth.balance).toLocaleString('en-US', { maximumFractionDigits: 6 }) : '0.000000'}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                ${walletDetails?.eth.usdValue || '0.00'} USD
                                            </p>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                         <Separator />
                         <div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="w-full">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Export Private Key
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action is highly sensitive. Exporting your private key exposes it.
                                        Do not share it with anyone. Anyone with your private key can take full control of your wallet.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={exportWallet}>Confirm Export</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                             <p className="text-xs text-muted-foreground text-center pt-2">
                                For use in other wallets like MetaMask. Keep it secret, keep it safe!
                            </p>
                         </div>
                    </TabsContent>
                    <TabsContent value="send" className="mt-4">
                        <Alert variant="default" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Gas Fees Required</AlertTitle>
                            <AlertDescription>
                                Sending tokens requires a small amount of Base ETH for transaction fees (gas).
                            </AlertDescription>
                        </Alert>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="recipient"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Recipient Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0x..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Amount to Send</FormLabel>
                                        <div className="relative">
                                            <Input type="number" step="any" placeholder="0.0" {...field} className="pr-16"/>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                 <span className="text-muted-foreground sm:text-sm">{walletDetails?.rewardToken.symbol || 'CQT'}</span>
                                            </div>
                                        </div>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                <Button type="submit" className="w-full" disabled={isSending}>
                                    {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Send Tokens
                                </Button>
                            </form>
                        </Form>
                    </TabsContent>
                    <TabsContent value="history" className="mt-4">
                       <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Quiz Rewards</CardTitle>
                                <CardDescription>History of rewards claimed from completing quizzes.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-72">
                                     {isHistoryLoading ? (
                                        <div className="space-y-4">
                                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                                        </div>
                                    ) : history.length > 0 ? (
                                        <div className="space-y-4">
                                            {history.map((item) => (
                                                <div key={item._id} className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-green-500/10 rounded-full">
                                                            <Coins className="h-5 w-5 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold capitalize flex items-center gap-1">
                                                                {item.difficulty} Quiz
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger>
                                                                            <ExternalLink className="h-3 w-3 text-muted-foreground"/>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>ID: {item.quizId}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                         <p className="font-semibold text-green-600">
                                                            +{item.score}/{item.maxScore} pts
                                                         </p>
                                                         <p className="text-sm text-muted-foreground">
                                                            {item.percentage}%
                                                         </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-center h-48 rounded-md bg-muted/50">
                                            <BookOpen className="h-10 w-10 text-muted-foreground mb-2" />
                                            <h3 className="font-semibold">No History Yet</h3>
                                            <p className="text-sm text-muted-foreground">Complete a quiz to see your rewards here.</p>
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    