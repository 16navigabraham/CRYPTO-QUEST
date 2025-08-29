// src/app/actions.ts
'use server';

import { generateQuizQuestions, type GenerateQuizQuestionsInput, type GenerateQuizQuestionsOutput } from '@/ai/flows/quiz-generator';
import { textToSpeechFlow, type TextToSpeechOutput } from '@/ai/flows/text-to-speech';
import { explainQuestion, type ExplainQuestionInput, type ExplainQuestionOutput } from '@/ai/flows/explain-question';
import { publicClient } from '@/lib/viem';
import { contractAbi, contractAddress } from '@/lib/contract';
import { erc20Abi, formatUnits, type Hex, formatEther } from 'viem';

const API_BASE_URL = 'https://cryptoquest-backend-q7ui.onrender.com';

async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `API request failed with status ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API Error at ${endpoint}:`, error);
        throw error;
    }
}


export async function uploadToPinata(file: File): Promise<string> {
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

export async function createUser(walletAddress: string, username: string, profilePictureUrl: string | null) {
  try {
    const response = await apiRequest('/api/users', {
      method: 'POST',
      body: JSON.stringify({
        walletAddress,
        username,
        profilePictureUrl,
      }),
    });
    
    return response;
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof Error && error.message.includes('User with this wallet address already exists')) {
        // This is not an error in the "create or update" flow, so we can ignore it
        // and let the update logic handle it.
        return { isDuplicate: true };
    }
    throw error;
  }
}

export async function updateUser(walletAddress: string, username: string, profilePictureUrl: string | null) {
    try {
      const response = await apiRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          walletAddress,
          username,
          profilePictureUrl,
        }),
      });
      return response;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export async function getUserProfile(walletAddress: string) {
    if (!walletAddress) return null;
    try {
        const response = await apiRequest(`/api/users/${walletAddress}`);
        return response;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        if (error instanceof Error && error.message.includes('User not found')) {
            return null;
        }
        throw error;
    }
}

export async function submitScore(walletAddress: string, quizId: string, score: number, difficulty: string, maxScore: number) {
  try {
    const response = await apiRequest('/api/scores', {
      method: 'POST',
      body: JSON.stringify({ 
        walletAddress, 
        quizId, 
        score, 
        difficulty: difficulty.toLowerCase(),
        maxScore,
      }),
    });
    return response;
  } catch (error) {
    console.error('Error submitting score:', error);
    if (error instanceof Error && error.message.includes('already completed')) {
      return { data: { isDuplicate: true }, message: 'Score already submitted' };
    }
    throw error;
  }
}


export async function getLeaderboard() {
    try {
        const response = await apiRequest('/api/leaderboard');
        return response?.data?.leaderboard || [];
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
}

export async function getUserQuizHistory(walletAddress: string) {
    if (!walletAddress) return null;
    try {
        const response = await apiRequest(`/api/users/${walletAddress}/history`);
        return response;
    } catch (error) {
        console.error('Error fetching quiz history:', error);
        if (error instanceof Error && error.message.includes('User not found')) {
            return null;
        }
        throw error;
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
            balance: formatUnits(balance as bigint, decimals),
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
