
'use server';
/**
 * @fileOverview Fetches and summarizes farming-related news.
 *
 * - getFarmingNews - Retrieves recent farming news summaries for a region and language.
 * - FarmingNewsInput - The input type for the getFarmingNews function.
 * - FarmingNewsOutput - The return type for the getFarmingNews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FarmingNewsInputSchema = z.object({
  region: z.string().describe('The geographical region or country for which to fetch farming news (e.g., "Punjab, India", "California, USA", "Kenya").'),
  language: z.string().describe('The desired language for the news summaries (e.g., "English", "Hindi", "Swahili").'),
  count: z.number().optional().default(3).describe('Number of news items to fetch.'),
});
export type FarmingNewsInput = z.infer<typeof FarmingNewsInputSchema>;

const NewsItemSchema = z.object({
  title: z.string().describe('The headline of the news article.'),
  summary: z.string().describe('A concise summary of the news article.'),
  source: z.string().optional().describe('The source or publisher of the news (e.g., "Reuters", "Local Times").'),
  publishedDate: z.string().optional().describe('The publication date of the news, if available (ISO 8601 format).'),
});

const FarmingNewsOutputSchema = z.object({
  newsItems: z.array(NewsItemSchema).describe('A list of recent farming news summaries.'),
});
export type FarmingNewsOutput = z.infer<typeof FarmingNewsOutputSchema>;

export async function getFarmingNews(input: FarmingNewsInput): Promise<FarmingNewsOutput> {
  return farmingNewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'farmingNewsPrompt',
  input: {schema: FarmingNewsInputSchema},
  output: {schema: FarmingNewsOutputSchema},
  prompt: `You are an agricultural news aggregator. Your task is to find and summarize recent (within the last 7-10 days if possible, otherwise most relevant) and important farming-related news.

Region: {{{region}}}
Language for summaries: {{{language}}}
Number of news items: {{{count}}}

Focus on news concerning:
- Crop prices and market trends
- Weather impacts on agriculture (e.g., droughts, floods, unusual patterns)
- New farming techniques or technologies
- Government policies or schemes affecting farmers
- Pest and disease outbreaks

For each news item, provide:
- A clear title.
- A concise summary (2-3 sentences).
- The source (if identifiable, otherwise state "General News").
- The published date if available (try to find it, use YYYY-MM-DD format).

Ensure the news is relevant to the specified region. If the region is broad (e.g., "USA"), try to find news applicable to a significant agricultural area within it or general national news.
Prioritize factual and actionable information for farmers. Avoid sensationalism.
Return the output in the specified language.
`,
});

const farmingNewsFlow = ai.defineFlow(
  {
    name: 'farmingNewsFlow',
    inputSchema: FarmingNewsInputSchema,
    outputSchema: FarmingNewsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Failed to get farming news from AI model.");
    }
    return output;
  }
);
