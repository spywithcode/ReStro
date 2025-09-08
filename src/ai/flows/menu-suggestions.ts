'use server';
/**
 * @fileOverview Provides AI-powered menu suggestions for restaurant admins.
 *
 * - getMenuSuggestions - A function that generates menu suggestions.
 * - MenuSuggestionsInput - The input type for the getMenuSuggestions function.
 * - MenuSuggestionsOutput - The return type for the getMenuSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MenuSuggestionsInputSchema = z.object({
  popularItems: z
    .string()
    .describe('A list of the most popular items on the menu.'),
  currentSpecials: z.string().describe('A description of the current specials.'),
  menu: z.string().describe('The full menu of the restaurant'),
});
export type MenuSuggestionsInput = z.infer<typeof MenuSuggestionsInputSchema>;

const MenuSuggestionsOutputSchema = z.object({
  suggestions: z.string().describe('AI-powered menu suggestions.'),
});
export type MenuSuggestionsOutput = z.infer<typeof MenuSuggestionsOutputSchema>;

export async function getMenuSuggestions(input: MenuSuggestionsInput): Promise<MenuSuggestionsOutput> {
  return menuSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'menuSuggestionsPrompt',
  input: {schema: MenuSuggestionsInputSchema},
  output: {schema: MenuSuggestionsOutputSchema},
  prompt: `You are a restaurant menu consultant. Based on the current menu, popular items, and current specials, suggest some new menu items or modifications to existing ones to attract more customers.

Current Menu: {{{menu}}}
Popular Items: {{{popularItems}}}
Current Specials: {{{currentSpecials}}}

Suggestions:`, 
});

const menuSuggestionsFlow = ai.defineFlow(
  {
    name: 'menuSuggestionsFlow',
    inputSchema: MenuSuggestionsInputSchema,
    outputSchema: MenuSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
