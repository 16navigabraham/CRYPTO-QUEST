
'use server';

import { generateQuizQuestions, type GenerateQuizQuestionsInput, type GenerateQuizQuestionsOutput } from '@/ai/flows/quiz-generator';
import { textToSpeechFlow, type TextToSpeechOutput } from '@/ai/flows/text-to-speech';
import { explainQuestion, type ExplainQuestionInput, type ExplainQuestionOutput } from '@/ai/flows/explain-question';
import { publicClient } from '@/lib/viem';
import { contractAbi, contractAddress } from '@/lib/contract';
import { erc20Abi, formatUnits, type Hex } from 'viem';

const BACKEND_URL = 'https://cryptoquest-backend-q7ui.onrender.com';

// --- User Management ---
export async function createUser(privyDid: string, walletAddress: string, username: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        privyDid,
        walletAddress,
        username,
      }),
    });
    
    // A 409 Conflict means the user already exists, which is not an error for this flow.
    if (!response.ok && response.status !== 409) {
        const errorData = await response.json();
        console.error('Failed to create user:', errorData.message);
        // We don't throw an error to the client here as it's not a critical UI-blocking event.
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    // Don't throw error to the client for this
  }
}

// --- Score Management ---
export async function submitScore(privyDid: string, quizId: string, score: number, difficulty: string) {
  if (!BACKEND_URL) {
    console.error('BACKEND_URL is not set. Cannot submit score.');
    throw new Error('Server configuration error. Please contact support.');
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        privyDid, 
        quizId, 
        score, 
        difficulty: difficulty.toLowerCase(),
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      // The backend provides a 'message' field on error, which we can pass to the client.
      throw new Error(data.message || `An unknown error occurred. Status: ${response.status}`);
    }

    // Return the successful response data
    return data;
  } catch (error) {
    console.error('Error submitting score:', error);
    // Re-throw the error so the client-side component can catch it and display a toast.
    // The error will now have a user-friendly message from the backend or the generic one from above.
    throw error;
  }
}


// --- Leaderboard ---
export async function getLeaderboard() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/leaderboard`);
        if (!response.ok) {
            throw new Error('Failed to fetch leaderboard');
        }
        const data = await response.json();
        return data.data.leaderboard;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
}


const getTopicForDifficulty = (difficulty: string): string => {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 'Blockchain Fundamentals & Basic Trading';
    case 'intermediate':
      return 'Smart Contracts, DeFi Protocols & NFTs';
    case 'advanced':
      return 'Solidity, Cross-chain concepts, MEV, and Protocol Governance';
    case 'expert':
      return 'Advanced Smart Contract Security, Yield Farming, and Flash Loans';
    case 'master':
      return 'Advanced Cryptography, Protocol Research, and Layer 2 Scaling';
    default:
      return 'Web3 Development';
  }
};

export async function getQuizQuestions(difficulty: string, numberOfQuestions: number): Promise<GenerateQuizQuestionsOutput> {
  const input: GenerateQuizQuestionsInput = {
    difficultyLevel: difficulty,
    topic: getTopicForDifficulty(difficulty),
    numberOfQuestions: numberOfQuestions,
  };

  try {
    const questions = await generateQuizQuestions(input);
    if (!questions || questions.length === 0) {
      throw new Error('AI failed to generate questions.');
    }
    return questions;
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    throw new Error('Could not fetch quiz questions. Please try again later.');
  }
}

export async function getHint(question: string, answers: string[]): Promise<ExplainQuestionOutput> {
  const input: ExplainQuestionInput = {
    question,
    answers,
  };
  try {
    const response = await explainQuestion(input);
    if (!response || !response.explanation) {
      throw new Error('AI failed to generate a hint.');
    }
    return response;
  } catch (error) {
    console.error('Error getting hint:', error);
    throw new Error('Could not get a hint at this time. Please try again.');
  }
}


export async function textToSpeech(text: string): Promise<TextToSpeechOutput> {
  try {
    const response = await textToSpeechFlow(text);
    return response;
  } catch (error) {
    console.error('Error with text-to-speech:', error);
    throw new Error('Could not convert text to speech.');
  }
}

export async function getTokenInfo(userAddress: `0x${string}`) {
    let tokenAddress: `0x${string}`;
    try {
        tokenAddress = await publicClient.readContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: 'rewardToken',
        });
    } catch (error) {
        console.error('Could not fetch reward token address from contract, using fallback:', error);
        tokenAddress = '0xb50c192B2AD5A34c30FbFbeb95fd51B0E5Af28E4';
    }

    try {
        const [balance, symbol, decimals] = await Promise.all([
            publicClient.readContract({
                address: tokenAddress,
                abi: erc20Abi,
                functionName: 'balanceOf',
                args: [userAddress],
            }),
            publicClient.readContract({
                address: tokenAddress,
                abi: erc20Abi,
                functionName: 'symbol',
            }),
            publicClient.readContract({
                address: tokenAddress,
                abi: erc20Abi,
                functionName: 'decimals',
            }),
        ]);

        return {
            balance: formatUnits(balance, decimals),
            symbol,
            decimals,
            tokenAddress,
        };
    } catch (error) {
        console.error('Error fetching token info:', error);
        // Fallback for UI display if everything fails
        return {
            balance: '0',
            symbol: 'CQT',
            decimals: 18,
            tokenAddress: tokenAddress,
        };
    }
}

export async function getContractRewardPool(): Promise<{ balance: string; symbol: string; }> {
    try {
         const [balance, tokenAddress] = await Promise.all([
            publicClient.readContract({
                address: contractAddress,
                abi: contractAbi,
                functionName: 'getContractBalance',
            }),
            publicClient.readContract({
                address: contractAddress,
                abi: contractAbi,
                functionName: 'rewardToken',
            })
         ]);

        const [decimals, symbol] = await Promise.all([
             publicClient.readContract({
                address: tokenAddress,
                abi: erc20Abi,
                functionName: 'decimals',
            }),
            publicClient.readContract({
                address: tokenAddress,
                abi: erc20Abi,
                functionName: 'symbol',
            })
        ]);
        
        return {
            balance: formatUnits(balance, decimals),
            symbol,
        };

    } catch (error) {
        console.error('Error fetching contract reward pool:', error);
        return {
            balance: '0',
            symbol: 'Tokens',
        };
    }
}
