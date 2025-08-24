// src/ai/flows/quiz-generator.ts
'use server';
/**
 * @fileOverview A quiz question generator AI agent.
 *
 * - generateQuizQuestions - A function that handles the quiz question generation process.
 * - GenerateQuizQuestionsInput - The input type for the generateQuizQuestions function.
 * - GenerateQuizQuestionsOutput - The return type for the generateQuizQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizQuestionsInputSchema = z.object({
  difficultyLevel: z
    .string()
    .describe('The difficulty level of the quiz (Beginner, Intermediate, Advanced, Expert, Master).'),
  topic: z.string().describe('The topic of the quiz questions (e.g., Blockchain, Smart Contracts, DeFi, Web3, Solidity).'),
  numberOfQuestions: z.number().describe('The number of questions to generate.'),
});
export type GenerateQuizQuestionsInput = z.infer<typeof GenerateQuizQuestionsInputSchema>;

const QuizQuestionSchema = z.object({
  question: z.string().describe('The quiz question.'),
  answers: z.array(z.string()).describe('An array of possible answers.'),
  correctAnswerIndex: z
    .number()
    .describe('The index of the correct answer in the answers array.'),
});

const GenerateQuizQuestionsOutputSchema = z.array(QuizQuestionSchema);
export type GenerateQuizQuestionsOutput = z.infer<typeof GenerateQuizQuestionsOutputSchema>;

export async function generateQuizQuestions(input: GenerateQuizQuestionsInput): Promise<GenerateQuizQuestionsOutput> {
  return generateQuizQuestionsFlow(input);
}

const generateQuizQuestionsPrompt = ai.definePrompt({
  name: 'generateQuizQuestionsPrompt',
  input: {schema: GenerateQuizQuestionsInputSchema},
  output: {schema: GenerateQuizQuestionsOutputSchema},
  prompt: `You are a quiz generator for a crypto education platform called CryptoQuest.

You will generate {{numberOfQuestions}} quiz questions and answers for developers, related to the topic of "{{topic}}".
The difficulty level is {{difficultyLevel}}.

Each question should have 4 possible answers, and you must specify the index of the correct answer.

Ensure that the questions are appropriate for the specified difficulty level. Use your best judgement to create compelling and technically accurate questions.

If the difficulty is Beginner, focus on basic concepts and syntax.
If the difficulty is Intermediate, focus on common patterns and practices.
If the difficulty is Advanced, focus on complex topics, advanced mechanics and optimization.
If the difficulty is Expert, focus on in-depth, niche topics.
If the difficulty is Master, create the ultimate challenge questions.

Output the questions as a JSON array of objects with the following structure:

[{
  "question": "The quiz question.",
  "answers": ["Answer 1", "Answer 2", "Answer 3", "Answer 4"],
  "correctAnswerIndex": 0 // The index of the correct answer in the answers array.
}]
`,
});

const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateQuizQuestionsPrompt(input);
    return output!;
  }
);
