
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { getQuizQuestions, submitScore, textToSpeech, getWalletDetails, getHint } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowLeft, CheckCircle, RefreshCw, XCircle, Volume2, Award, Wallet, Home, Loader2, PartyPopper, AlertTriangle, Lightbulb, Timer, Zap } from 'lucide-react';
import { usePrivy, useWallets, useSendTransaction } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { type Hex, encodeFunctionData, keccak256, encodePacked } from 'viem';
import { base } from 'viem/chains';
import { useToast } from '@/hooks/use-toast';
import { contractAbi, contractAddress } from '@/lib/contract';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Question = {
  question: string;
  answers: string[];
  correctAnswerIndex: number;
};

type QuizState = 'selection' | 'loading' | 'active' | 'completed' | 'error';
type ClaimState = 'idle' | 'claiming' | 'claimed' | 'claim_error';

const difficultyMap: { [key: string]: { id: number; questionCount: number; passPercentage: number; } } = {
  beginner: { id: 0, questionCount: 20, passPercentage: 70 },
  intermediate: { id: 1, questionCount: 25, passPercentage: 75 },
  advanced: { id: 2, questionCount: 30, passPercentage: 80 },
  expert: { id: 3, questionCount: 25, passPercentage: 85 },
  master: { id: 4, questionCount: 20, passPercentage: 90 },
};

export default function QuizPage({ params }: { params: { difficulty: string } }) {
  const [quizState, setQuizState] = useState<QuizState>('selection');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [claimState, setClaimState] = useState<ClaimState>('idle');
  const [rewardTokenSymbol, setRewardTokenSymbol] = useState<string | null>(null);
  const [hint, setHint] = useState<{ forQuestion: number; text: string } | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);
  
  const { toast } = useToast();
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const { sendTransaction, isSending } = useSendTransaction();
  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
  const router = useRouter();
  
  const difficulty = useMemo(() => params.difficulty.charAt(0).toUpperCase() + params.difficulty.slice(1), [params.difficulty]);
  const difficultyConfig = useMemo(() => difficultyMap[params.difficulty], [params.difficulty]);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/login');
    }
  }, [ready, authenticated, router]);

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

  const loadQuestions = useCallback(async (questionCount: number) => {
    if (!difficultyConfig) {
        setErrorMessage('Invalid difficulty level.');
        setQuizState('error');
        return;
    }
    setQuizState('loading');
    setNumberOfQuestions(questionCount);
    setIsAnswered(false);
    setSelectedAnswerIndex(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setAudioUrl(null);
    setClaimState('idle');
    setHint(null);
    setIsHintLoading(false);
    setQuizId(crypto.randomUUID());
    try {
      const fetchedQuestions = await getQuizQuestions(params.difficulty, questionCount);
      setQuestions(fetchedQuestions);
      setQuizState('active');
      if (fetchedQuestions.length > 0) {
        handleTextToSpeech(fetchedQuestions[0].question);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred.');
      setQuizState('error');
    }
  }, [params.difficulty, difficultyConfig, handleTextToSpeech]);

  useEffect(() => {
    if(ready && authenticated && embeddedWallet?.address) {
        getWalletDetails(embeddedWallet.address as `0x${string}`).then(details => setRewardTokenSymbol(details.rewardToken.symbol));
    }
  }, [ready, authenticated, embeddedWallet?.address]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;

    setSelectedAnswerIndex(answerIndex);
    setIsAnswered(true);
    setHint(null);

    if (answerIndex === questions[currentQuestionIndex].correctAnswerIndex) {
      setScore(score + 1);
    }
  };

  const percentage = numberOfQuestions > 0 ? Math.round((score / numberOfQuestions) * 100) : 0;

  const handleQuizCompletion = useCallback(async () => {
    setQuizState('completed');
    if (!user?.wallet?.address || !quizId) return;

    try {
      const result = await submitScore(user.wallet.address, quizId, score, params.difficulty);
       if (result.isDuplicate) {
        toast({
          title: "Score Not Saved",
          description: "You have already completed a quiz with this ID.",
          variant: 'default'
        });
      } else {
        toast({
          title: "Score Saved!",
          description: "Your score has been saved to the leaderboard.",
        });
      }
    } catch (error) {
      console.error("Failed to submit score:", error);
      toast({
        variant: 'destructive',
        title: "Score Sync Failed",
        description: error instanceof Error ? error.message : "Could not save your score to the server.",
      });
    }
  }, [user?.wallet?.address, quizId, score, params.difficulty, toast]);


  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswerIndex(null);
      setIsAnswered(false);
      setAudioUrl(null);
      setHint(null);
      handleTextToSpeech(questions[nextIndex].question);
    } else {
      handleQuizCompletion();
    }
  };

  const handleGetHint = async () => {
    if (!currentQuestion) return;
    setIsHintLoading(true);
    setHint(null);
    try {
      const response = await getHint(currentQuestion.question, currentQuestion.answers);
      setHint({
        forQuestion: currentQuestionIndex,
        text: response.explanation
      });
    } catch(error) {
      toast({
        variant: 'destructive',
        title: "Hint Failed",
        description: error instanceof Error ? error.message : "Could not generate a hint.",
      });
    } finally {
      setIsHintLoading(false);
    }
  }

  const handleClaimRewards = async () => {
    if (!embeddedWallet || !quizId || !difficultyConfig) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Wallet not connected, user not found, or quiz ID is missing.',
      });
      return;
    }

    setClaimState('claiming');

    try {
      const quizIdHashed = keccak256(encodePacked(['string'], [quizId]));
      const scoreInPercentage = Math.round((score / numberOfQuestions) * 100);
      
      const unsignedTx = {
          to: contractAddress,
          chainId: base.id,
          data: encodeFunctionData({
            abi: contractAbi,
            functionName: 'claimReward',
            args: [quizIdHashed, BigInt(difficultyConfig.id), BigInt(scoreInPercentage), BigInt(100)] // Use 100 as the 1x multiplier
          }),
      };

      const {hash} = await sendTransaction(unsignedTx);

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
  
  if (!ready || !difficultyConfig) {
    return (
       <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
       </div>
    );
  }

  if (quizState === 'selection') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CardTitle className="text-3xl">Choose Your Quiz Mode</CardTitle>
            <CardDescription>Select the length of your {difficulty} quiz.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card 
              className="group cursor-pointer transform transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20"
              onClick={() => loadQuestions(10)}
            >
              <CardHeader className="flex flex-col items-center text-center space-y-4 p-6">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Zap className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl">Quick Quiz</CardTitle>
                  <CardDescription>10 questions</CardDescription>
                </div>
              </CardHeader>
            </Card>
            <Card 
              className="group cursor-pointer transform transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20"
              onClick={() => loadQuestions(difficultyConfig.questionCount)}
            >
              <CardHeader className="flex flex-col items-center text-center space-y-4 p-6">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Timer className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl">Full Quiz</CardTitle>
                  <CardDescription>{difficultyConfig.questionCount} questions</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </CardContent>
          <CardFooter>
            <Button asChild variant="link" className="w-full text-muted-foreground">
                <Link href="/home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
                </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (quizState === 'loading') {
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
                <Button onClick={() => setQuizState('selection')}>
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

  const passed = percentage >= difficultyConfig.passPercentage;

  if (quizState === 'completed') {
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
                {score} / {numberOfQuestions}
              </p>
              <p className={cn("text-2xl font-semibold", passed ? "text-green-500" : "text-destructive")}>{percentage}%</p>
              <p className="text-sm text-muted-foreground">{passed ? "Congratulations, you passed!" : `You needed ${difficultyConfig.passPercentage}% to pass.`}</p>
            </div>
            {passed && (
              <Card className="p-4 space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Award className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">Claim Your Rewards</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Claim your {rewardTokenSymbol || 'tokens'} on Base for completing this quiz!
                </p>
                
                 <Alert variant="default" className="text-left">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Gas Fees Required</AlertTitle>
                  <AlertDescription>
                    You will need a small amount of Base ETH in your wallet to pay for transaction fees (gas) to claim your rewards.
                  </AlertDescription>
                </Alert>

                <Button onClick={handleClaimRewards} disabled={isSending || claimState === 'claimed'}>
                  {(isSending || claimState === 'claiming') && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {claimState === 'claimed' ? <><PartyPopper className="mr-2 h-4 w-4" />Claimed!</> : 'Claim Rewards'}
                </Button>
                {claimState === 'claim_error' && (
                    <p className="text-xs text-destructive flex items-center justify-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Something went wrong. Please try again.
                    </p>
                )}
              </Card>
            )}
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
            <Button onClick={() => setQuizState('selection')}>
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
            Question {currentQuestionIndex + 1} of {numberOfQuestions}
          </CardDescription>
          <Progress value={progressValue} className="w-full mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-lg sm:text-xl font-semibold text-center text-card-foreground flex-grow">{currentQuestion.question}</p>
            <div className='flex flex-col gap-2'>
              <Button onClick={playAudio} variant="ghost" size="icon" disabled={!audioUrl}>
                <Volume2 className="h-6 w-6" />
              </Button>
              <Button onClick={handleGetHint} variant="ghost" size="icon" disabled={isHintLoading || isAnswered}>
                 {isHintLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Lightbulb className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {hint && hint.forQuestion === currentQuestionIndex && (
             <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>Hint</AlertTitle>
              <AlertDescription>{hint.text}</AlertDescription>
            </Alert>
          )}

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
                    isAnswered && (isCorrect ? "border-green-500 bg-green-500/10 text-foreground" : ""),
                    isAnswered && isSelected && !isCorrect && "border-destructive bg-destructive/10 text-foreground"
                  )}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isAnswered}
                >
                  <div className="flex items-center w-full">
                    <span className="flex-grow">{answer}</span>
                    {isAnswered && isSelected && isCorrect && <CheckCircle className="h-5 w-5 text-green-500 ml-2 flex-shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-destructive ml-2 flex-shrink-0" />}
                    {isAnswered && !isSelected && isCorrect && <CheckCircle className="h-5 w-5 text-green-500 ml-2 flex-shrink-0" />}
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
