'use server';

import { generateQuizQuestions, type GenerateQuizQuestionsInput, type GenerateQuizQuestionsOutput } from '@/ai/flows/quiz-generator';
import { textToSpeechFlow, type TextToSpeechOutput } from '@/ai/flows/text-to-speech';
import { publicClient } from '@/lib/viem';
import { contractAbi, contractAddress } from '@/lib/contract';
import { erc20Abi, formatUnits } from 'viem';


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
