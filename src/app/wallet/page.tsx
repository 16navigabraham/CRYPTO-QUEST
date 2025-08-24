
'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { getTokenInfo } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2, Send, Wallet as WalletIcon, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createWalletClient, http, parseUnits, type Hex, type EIP1193Provider, erc20Abi } from 'viem';
import { base } from 'viem/chains';
import { publicClient } from '@/lib/viem';

const sendSchema = z.object({
  recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Amount must be a positive number',
  }),
});

type TokenInfo = {
    balance: string;
    symbol: string;
    decimals: number;
    tokenAddress: `0x${string}`;
}

export default function WalletPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { ready, authenticated, user } = usePrivy();
    const { wallets } = useWallets();
    const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');

    const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [copied, setCopied] = useState(false);

    const form = useForm<z.infer<typeof sendSchema>>({
        resolver: zodResolver(sendSchema),
        defaultValues: { recipient: '', amount: '' },
    });

    const fetchTokenInfo = useCallback(async () => {
        if (embeddedWallet) {
            setIsLoading(true);
            const info = await getTokenInfo(embeddedWallet.address as `0x${string}`);
            setTokenInfo(info);
            setIsLoading(false);
        }
    }, [embeddedWallet]);

    useEffect(() => {
        if (ready && !authenticated) {
            router.push('/login');
        }
        if (ready && authenticated && embeddedWallet) {
            fetchTokenInfo();
        }
    }, [ready, authenticated, router, embeddedWallet, fetchTokenInfo]);

    const handleCopy = () => {
        if (embeddedWallet?.address) {
            navigator.clipboard.writeText(embeddedWallet.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    
    const onSubmit = async (values: z.infer<typeof sendSchema>) => {
        if (!embeddedWallet || !tokenInfo) return;

        setIsSending(true);

        try {
            await embeddedWallet.switchChain(base.id);
            const provider = await embeddedWallet.getEthersProvider?.() as EIP1193Provider;
            const walletClient = createWalletClient({
                account: embeddedWallet.address as Hex,
                chain: base,
                transport: http(),
            });

            const amountToSend = parseUnits(values.amount, tokenInfo.decimals);

            if (amountToSend > parseUnits(tokenInfo.balance, tokenInfo.decimals)) {
                 toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Insufficient balance.',
                });
                setIsSending(false);
                return;
            }

            const { request } = await publicClient.simulateContract({
                address: tokenInfo.tokenAddress,
                abi: erc20Abi,
                functionName: 'transfer',
                args: [values.recipient as Hex, amountToSend],
                account: embeddedWallet.address as Hex,
            });

            const hash = await walletClient.writeContract(request);

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
            // Refresh balance after a short delay
            setTimeout(fetchTokenInfo, 5000); 

        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Transaction Failed',
                description: error.message || 'An unknown error occurred.',
            });
        } finally {
            setIsSending(false);
        }
    }


    if (!ready || isLoading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
                 <Card className="w-full max-w-md animate-pulse">
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="space-y-2">
                             <Skeleton className="h-16 w-full" />
                             <Skeleton className="h-6 w-1/4 mx-auto" />
                        </div>
                         <Skeleton className="h-10 w-full" />
                         <Skeleton className="h-10 w-full" />
                         <Skeleton className="h-10 w-full" />
                    </CardContent>
                 </Card>
            </div>
        );
    }
    

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md">
        <Button asChild variant="ghost" className="mb-4">
            <Link href="/home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <WalletIcon className="h-6 w-6" /> Your Wallet
            </CardTitle>
            <CardDescription>View your balance and send tokens.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
                <Card className="bg-muted/50 p-4 text-center">
                     <CardTitle className="text-4xl font-bold">
                        {tokenInfo ? `${parseFloat(tokenInfo.balance).toFixed(2)}` : '0.00'}
                    </CardTitle>
                    <CardDescription className="font-semibold text-lg">{tokenInfo?.symbol || 'CQT'}</CardDescription>
                </Card>
            
                 <div className="space-y-2">
                    <p className="text-sm font-medium">Your Wallet Address</p>
                    <div className="flex items-center gap-2 rounded-md border bg-background p-2">
                        <p className="text-xs text-muted-foreground break-all flex-grow">
                            {embeddedWallet?.address}
                        </p>
                         <Button variant="ghost" size="icon" onClick={handleCopy} className="h-7 w-7">
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                 </div>

                <div>
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
                                    <FormControl>
                                        <Input type="number" placeholder="0.0" {...field} />
                                    </FormControl>
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
                </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

