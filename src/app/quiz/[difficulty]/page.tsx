
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { getQuizQuestions, textToSpeech } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowLeft, CheckCircle, RefreshCw, XCircle, Volume2, Award, Wallet, Home, Loader2, PartyPopper, AlertTriangle } from 'lucide-react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { createWalletClient, http, type EIP1193Provider, stringToHex, Hex } from 'viem';
import { base } from 'viem/chains';
import { contractAddress, contractAbi } from '@/lib/contract';
import { useToast } from '@/hooks/use-toast';

type Question = {
  question: string;
  answers: string[];
  correctAnswerIndex: number;
};

type QuizState = 'loading' | 'active' | 'completed' | 'error';
type ClaimState = 'idle' | 'claiming' | 'claimed' | 'claim_error';

const difficultyMap: { [key: string]: number } = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
  expert: 3,
  master: 4,
};

export default function QuizPage({ params }: { params: { difficulty: string } }) {
  const [quizState, setQuizState] = useState<QuizState>('loading');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [quizId, setQuizId] = useState<Hex | null>(null);
  const [claimState, setClaimState] = useState<ClaimState>('idle');
  
  const { toast } = useToast();
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/login');
    }
  }, [ready, authenticated, router]);

  const difficulty = useMemo(() => params.difficulty.charAt(0).toUpperCase() + params.difficulty.slice(1), [params.difficulty]);

  const handleTextToSpeech = useCallback(async (text: string) => {
    try {
      const response = await textToSpeech(text);
      if (response && response.media) {
        setAudioUrl(response.media);
      }
    } catch (error) {
      console.error('Error generating speech:', error);
    }
  }, []);

  const loadQuestions = useCallback(async () => {
    setQuizState('loading');
    setIsAnswered(false);
    setSelectedAnswerIndex(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setAudioUrl(null);
    setClaimState('idle');
    setQuizId(stringToHex(crypto.randomUUID(), { size: 32 }));
    try {
      const fetchedQuestions = await getQuizQuestions(difficulty);
      setQuestions(fetchedQuestions);
      setQuizState('active');
      if (fetchedQuestions.length > 0) {
        handleTextToSpeech(fetchedQuestions[0].question);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred.');
      setQuizState('error');
    }
  }, [difficulty, handleTextToSpeech]);

  useEffect(() => {
    if(ready && authenticated) {
        loadQuestions();
    }
  }, [loadQuestions, ready, authenticated]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;

    setSelectedAnswerIndex(answerIndex);
    setIsAnswered(true);

    if (answerIndex === questions[currentQuestionIndex].correctAnswerIndex) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswerIndex(null);
      setIsAnswered(false);
      setAudioUrl(null);
      handleTextToSpeech(questions[nextIndex].question);
    } else {
      setQuizState('completed');
    }
  };

  const handleClaimRewards = async () => {
    if (!embeddedWallet || !quizId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Wallet not connected or quiz ID is missing.',
      });
      return;
    }

    setClaimState('claiming');

    try {
      await embeddedWallet.switchChain(base.id);
      const provider = await embeddedWallet.getEthersProvider?.() as EIP1193Provider;
      if (!provider) {
        throw new Error('Could not get wallet provider.');
      }
      const walletClient = createWalletClient({
        account: embeddedWallet.address as Hex,
        chain: base,
        transport: http(), 
      });

      const difficultyLevel = difficultyMap[difficulty.toLowerCase()];

      const { request } = await walletClient.simulateContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'claimReward',
        args: [quizId, difficultyLevel, score, 1],
        account: embeddedWallet.address as Hex,
      });
      
      const hash = await walletClient.writeContract(request);

      toast({
        title: 'Transaction Submitted',
        description: 'Your reward claim is being processed.',
        action: (
           <a href={`https://basescan.org/tx/${hash}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">View on Basescan</Button>
          </a>
        ),
      });

      setClaimState('claimed');

    } catch (error) {
      console.error('Error claiming rewards:', error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during claim.";
      toast({
        variant: 'destructive',
        title: 'Claim Failed',
        description: errorMessage.length > 100 ? errorMessage.substring(0, 100) + '...' : errorMessage,
      });
      setClaimState('claim_error');
    }
  };


  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(e => console.error("Audio play failed", e));
    }
  }, [audioUrl]);
  
  const playAudio = () => {
    if(audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio play failed", e));
    }
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressValue = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (quizState === 'loading' || !ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl animate-pulse">
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-6 w-1/5" />
            </div>
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-2.5 w-full mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (quizState === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>An Error Occurred</CardTitle>
                <CardDescription>{errorMessage}</CardDescription>
            </CardHeader>
            <CardFooter className="flex gap-2">
                <Button onClick={loadQuestions}>
                <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                </Button>
                <Button asChild variant="outline">
                <Link href="/home"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
                </Button>
           </CardFooter>
        </Card>
      </div>
    );
  }

  if (quizState === 'completed') {
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
            <CardDescription>You've finished the {difficulty} quiz.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className='space-y-2'>
              <p className="text-lg">Your final score is:</p>
              <p className="text-6xl font-bold text-primary">
                {score} / {questions.length}
              </p>
              <p className="text-2xl font-semibold text-accent">{percentage}%</p>
            </div>
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Claim Your Rewards</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Claim your CQT tokens on Base for completing this quiz!
              </p>
              <Button onClick={handleClaimRewards} disabled={claimState === 'claiming' || claimState === 'claimed'}>
                {claimState === 'claiming' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {claimState === 'claimed' ? <><PartyPopper className="mr-2 h-4 w-4" />Claimed!</> : 'Claim Rewards'}
              </Button>
              {claimState === 'claim_error' && (
                  <p className="text-xs text-destructive flex items-center justify-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Something went wrong. Please try again.
                  </p>
              )}
            </Card>
            {embeddedWallet && (
              <div className="space-y-2 text-left text-sm">
                 <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                  <p className="font-semibold">Your Wallet:</p>
                </div>
                <p className="text-xs text-muted-foreground break-all bg-muted p-2 rounded-md">
                  {embeddedWallet.address}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button onClick={loadQuestions}>
              <RefreshCw className="mr-2 h-4 w-4" /> Play Again
            </Button>
            <Button asChild variant="outline">
              <Link href="/home">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <audio ref={audioRef} src={audioUrl || ''} className="hidden" />
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <CardTitle>CryptoQuest: {difficulty}</CardTitle>
            <Badge variant="secondary">Score: {score}</Badge>
          </div>
          <CardDescription>
            Question {currentQuestionIndex + 1} of {questions.length}
          </CardDescription>
          <Progress value={progressValue} className="w-full mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center gap-4">
            <p className="text-lg sm:text-xl font-semibold text-center text-card-foreground">{currentQuestion.question}</p>
            <Button onClick={playAudio} variant="ghost" size="icon" disabled={!audioUrl}>
              <Volume2 className="h-6 w-6" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {currentQuestion.answers.map((answer, index) => {
              const isCorrect = index === currentQuestion.correctAnswerIndex;
              const isSelected = index === selectedAnswerIndex;

              return (
                <Button
                  key={index}
                  variant="outline"
                  size="lg"
                  className={cn(
                    "justify-start text-left h-auto py-3 whitespace-normal transition-all duration-300",
                    isAnswered && (isCorrect ? "border-primary bg-primary/10 text-foreground" : ""),
                    isAnswered && isSelected && !isCorrect && "border-destructive bg-destructive/10 text-foreground"
                  )}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isAnswered}
                >
                  <div className="flex items-center w-full">
                    <span className="flex-grow">{answer}</span>
                    {isAnswered && isSelected && isCorrect && <CheckCircle className="h-5 w-5 text-primary ml-2 flex-shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-destructive ml-2 flex-shrink-0" />}
                    {isAnswered && !isSelected && isCorrect && <CheckCircle className="h-5 w-5 text-primary ml-2 flex-shrink-0" />}
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          {isAnswered && (
            <Button onClick={handleNextQuestion}>
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
          )}
        </CardFooter>
      </Card>
      <Button asChild variant="link" className="mt-4 text-muted-foreground">
        <Link href="/home">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Abandon Quest
        </Link>
      </Button>
    </div>
  );
}
