
'use server';
/**
 * @fileOverview Provides weather-based farming advice.
 *
 * - getWeatherAdvice - Fetches weather summary and farming instructions for a given location and language.
 * - WeatherAdvisorInput - The input type for the getWeatherAdvice function.
 * - WeatherAdvisorOutput - The return type for the getWeatherAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WeatherAdvisorInputSchema = z.object({
  location: z.string().describe('The geographical location (e.g., city, region) for which to get weather advice.'),
  language: z.string().describe('The desired language for the advice (e.g., "English", "Hindi", "Telugu", "Tamil").'),
});
export type WeatherAdvisorInput = z.infer<typeof WeatherAdvisorInputSchema>;

const WeatherAdvisorOutputSchema = z.object({
  weatherSummary: z.string().describe('A brief summary of the current or forecasted weather for the location.'),
  farmingInstructions: z.string().describe('Actionable farming tips or instructions based on the weather.'),
  monthlyOutlook: z.string().describe('A general agricultural outlook for the location for the next month.'),
});
export type WeatherAdvisorOutput = z.infer<typeof WeatherAdvisorOutputSchema>;

export async function getWeatherAdvice(input: WeatherAdvisorInput): Promise<WeatherAdvisorOutput> {
  return farmerWeatherAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'farmerWeatherAdvisorPrompt',
  input: {schema: WeatherAdvisorInputSchema},
  output: {schema: WeatherAdvisorOutputSchema},
  prompt: `You are an expert agricultural advisor specializing in weather-based farming guidance.
Given the location: {{{location}}}.
Respond entirely in the language: {{{language}}}.

Provide the following in {{{language}}}:
1.  **Weather Summary**: A concise summary of the current weather forecast (today and tomorrow).
2.  **Farming Instructions**: 2-3 specific and actionable farming tips relevant to the current weather conditions and typical crops for the region.
3.  **Monthly Outlook**: A brief agricultural outlook for the next month in this region, considering typical seasonal patterns.

Focus on practical advice. If the location is too general, provide advice for a major agricultural area within that general location.
Example for "California": Focus on Central Valley.
Example for "India": You might mention advice relevant to the current major crop season (e.g., Kharif/Rabi) if inferable, or pick a major agricultural state.
Keep each section distinct and clearly labeled in your output, in the specified language ({{{language}}}).
`,
});

const farmerWeatherAdvisorFlow = ai.defineFlow(
  {
    name: 'farmerWeatherAdvisorFlow',
    inputSchema: WeatherAdvisorInputSchema,
    outputSchema: WeatherAdvisorOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Failed to get weather advice from AI model.");
    }
    return output;
  }
);

