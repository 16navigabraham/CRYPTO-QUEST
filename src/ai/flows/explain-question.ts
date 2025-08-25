// src/ai/flows/explain-question.ts
'use server';
/**
 * @fileOverview An AI agent that explains quiz questions.
 *
 * - explainQuestion - A function that generates a simple explanation for a given quiz question.
 * - ExplainQuestionInput - The input type for the explainQuestion function.
 * - ExplainQuestionOutput - The return type for the explainQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainQuestionInputSchema = z.object({
  question: z.string().describe('The quiz question to be explained.'),
  answers: z.array(z.string()).describe('The possible answers to the question.'),
});
export type ExplainQuestionInput = z.infer<typeof ExplainQuestionInputSchema>;

const ExplainQuestionOutputSchema = z.object({
    explanation: z.string().describe('A simple, beginner-friendly explanation of the concept behind the question. Do not reveal the correct answer.')
});
export type ExplainQuestionOutput = z.infer<typeof ExplainQuestionOutputSchema>;


export async function explainQuestion(input: ExplainQuestionInput): Promise<ExplainQuestionOutput> {
  return explainQuestionFlow(input);
}

const explainQuestionPrompt = ai.definePrompt({
  name: 'explainQuestionPrompt',
  input: {schema: ExplainQuestionInputSchema},
  output: {schema: ExplainQuestionOutputSchema},
  prompt: `You are an expert in blockchain education. A user is taking a quiz and has asked for a hint for the following question.

Question: "{{question}}"
Possible Answers: {{#each answers}}- {{this}}{{/each}}

Your task is to provide a simple, beginner-friendly explanation of the core concept being tested in this question. 

IMPORTANT: Do NOT reveal the correct answer or even hint at which option is correct. Your goal is to teach the underlying concept so the user can answer it themselves. Keep the explanation concise and easy to understand for someone with no prior web3 development knowledge.
`,
});

const explainQuestionFlow = ai.defineFlow(
  {
    name: 'explainQuestionFlow',
    inputSchema: ExplainQuestionInputSchema,
    outputSchema: ExplainQuestionOutputSchema,
  },
  async input => {
    const {output} = await explainQuestionPrompt(input);
    return output!;
  }
);
