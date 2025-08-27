'use server';

import { generateQuizQuestions, type GenerateQuizQuestionsInput, type GenerateQuizQuestionsOutput } from '@/ai/flows/quiz-generator';
import { textToSpeechFlow, type TextToSpeechOutput } from '@/ai/flows/text-to-speech';
import { explainQuestion, type ExplainQuestionInput, type ExplainQuestionOutput } from '@/ai/flows/explain-question';
import { publicClient } from '@/lib/viem';
import { contractAbi, contractAddress } from '@/lib/contract';
import { erc20Abi, formatUnits, type Hex, formatEther } from 'viem';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function uploadToPinata(file: File) {
    const pinataJwtKey = process.env.PINATA_JWT_KEY;
    if (!pinataJwtKey) {
        throw new Error('Pinata API key is not configured.');
    }
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${pinataJwtKey}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Pinata upload failed: ${errorData.error?.reason || response.statusText}`);
        }

        const data = await response.json();
        const dedicatedGateway = 'sapphire-careful-peacock-258.mypinata.cloud';
        return `https://${dedicatedGateway}/ipfs/${data.IpfsHash}`;
    } catch (error) {
        console.error('Error uploading to Pinata:', error);
        throw new Error('Failed to upload image to IPFS.');
    }
}


// --- User Management ---
export async function createUser(walletAddress: string, username: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress,
        username,
        profilePictureUrl: null,
      }),
    });
    
    // A 409 Conflict means the user already exists, which is not an error for this flow.
    if (!response.ok && response.status !== 409) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof Error && error.message.includes('already exists')) {
        return { isDuplicate: true };
    }
    throw error;
  }
}

export async function updateUser(walletAddress: string, username: string, profilePictureUrl: string | null) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          username,
          profilePictureUrl,
        }),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update user profile.');
      }
      return await response.json();
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export async function getUserProfile(walletAddress: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${walletAddress}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch user profile.');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

// --- Score Management ---
export async function submitScore(walletAddress: string, quizId: string, score: number, difficulty: string, maxScore: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        walletAddress, 
        quizId, 
        score, 
        difficulty: difficulty.toLowerCase(),
        maxScore,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 409) {
          console.log("Score submission ignored: Quiz already completed.");
          return { ...data, isDuplicate: true };
      }
      throw new Error(data.message || `An unknown error occurred. Status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error submitting score:', error);
    if (error instanceof Error && error.message.includes('already completed')) {
      return { isDuplicate: true };
    }
    throw error;
  }
}


// --- Leaderboard ---
export async function getLeaderboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/leaderboard`);
        if (!response.ok) {
            throw new Error('Failed to fetch leaderboard');
        }
        const leaderboardData = await response.json();
        return leaderboardData?.data?.leaderboard || [];
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

export async function getWalletDetails(userAddress: `0x${string}`) {
    let tokenAddress: `0x${string}`;
    try {
        tokenAddress = await publicClient.readContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: 'rewardToken',
        });
    } catch (error) {
        console.error('Could not fetch reward token address from contract, using fallback:', error);
        // Fallback address just in case
        tokenAddress = '0xf73978b3a7d1d4974abae11f696c1b4408c027a0';
    }

    try {
        const [rewardTokenBalance, symbol, decimals, ethBalance] = await Promise.all([
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
            publicClient.getBalance({ address: userAddress })
        ]);

        return {
            rewardToken: {
                balance: formatUnits(rewardTokenBalance, decimals),
                symbol,
                decimals,
                tokenAddress,
            },
            eth: {
                balance: formatEther(ethBalance),
                symbol: 'ETH',
            }
        };
    } catch (error) {
        console.error('Error fetching token info:', error);
        // Fallback for UI display if everything fails
        return {
             rewardToken: {
                balance: '0',
                symbol: 'CQT',
                decimals: 18,
                tokenAddress: tokenAddress,
            },
            eth: {
                balance: '0',
                symbol: 'ETH',
            }
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
