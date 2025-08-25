
'use server';

import { generateQuizQuestions, type GenerateQuizQuestionsInput, type GenerateQuizQuestionsOutput } from '@/ai/flows/quiz-generator';
import { textToSpeechFlow, type TextToSpeechOutput } from '@/ai/flows/text-to-speech';
import { publicClient } from '@/lib/viem';
import { contractAbi, contractAddress } from '@/lib/contract';
import { erc20Abi, formatUnits, type Hex } from 'viem';

const BACKEND_URL = process.env.BACKEND_URL;

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
    const data = await response.json();
    if (!response.ok && response.status !== 409) { // 409 is 'User already exists', which is fine.
        console.error('Failed to create user:', data.message);
    }
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
    throw new Error('Server configuration error.');
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        privyDid, 
        quizId, 
        score, 
        difficulty 
      }),
    });

    const data = await response.json();
    
    // If the response is not OK, but it's a 409 Conflict, it means the quiz was already completed.
    // This is not a critical failure, so we can allow the user to proceed.
    if (!response.ok && response.status !== 409) {
      console.error('Backend returned an error:', data);
      throw new Error(data.message || `Failed to submit score. Status: ${response.status}`);
    }

    if (response.status === 409) {
      console.log('Quiz already completed, proceeding...');
    }

    return data;
  } catch (error) {
    console.error('Error submitting score:', error);
    // Re-throw the error so the client knows something went wrong.
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
