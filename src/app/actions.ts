'use server';

import { generateQuizQuestions, type GenerateQuizQuestionsInput, type GenerateQuizQuestionsOutput } from '@/ai/flows/quiz-generator';
import { textToSpeechFlow, TextToSpeechOutput } from '@/ai/flows/text-to-speech';

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

export async function textToSpeech(text: string): Promise<TextToSpeechOutput> {
  try {
    const response = await textToSpeechFlow(text);
    return response;
  } catch (error) {
    console.error('Error with text-to-speech:', error);
    throw new Error('Could not convert text to speech.');
  }
}
