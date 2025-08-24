'use server';

import { generateQuizQuestions, type GenerateQuizQuestionsInput, type GenerateQuizQuestionsOutput } from '@/ai/flows/quiz-generator';

export async function getQuizQuestions(difficulty: string): Promise<GenerateQuizQuestionsOutput> {
  const input: GenerateQuizQuestionsInput = {
    difficultyLevel: difficulty,
    topic: 'Web3 Development',
    numberOfQuestions: 10,
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
