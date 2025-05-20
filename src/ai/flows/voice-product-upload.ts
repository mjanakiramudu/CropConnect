// 'use server';
/**
 * @fileOverview A voice-activated product upload flow for farmers.
 *
 * - voiceProductUpload - A function that handles the product upload process using voice input.
 * - VoiceProductUploadInput - The input type for the voiceProductUpload function.
 * - VoiceProductUploadOutput - The return type for the voiceProductUpload function.
 */

'use server';
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceProductUploadInputSchema = z.object({
  voiceInput: z
    .string()
    .describe(
      'Voice input from the user describing the product to be uploaded. For example: \"Add Rice in India for ₹5 per kg\"'
    ),
});
export type VoiceProductUploadInput = z.infer<typeof VoiceProductUploadInputSchema>;

const VoiceProductUploadOutputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  location: z.string().describe('The location where the product is grown/produced.'),
  price: z.number().describe('The price of the product.'),
  unit: z.string().describe('The unit of measurement for the product (e.g., kg, pound, etc.).'),
});
export type VoiceProductUploadOutput = z.infer<typeof VoiceProductUploadOutputSchema>;

export async function voiceProductUpload(input: VoiceProductUploadInput): Promise<VoiceProductUploadOutput> {
  return voiceProductUploadFlow(input);
}

const prompt = ai.definePrompt({
  name: 'voiceProductUploadPrompt',
  input: {schema: VoiceProductUploadInputSchema},
  output: {schema: VoiceProductUploadOutputSchema},
  prompt: `You are an AI assistant helping farmers to upload their products to an e-commerce platform using voice input.

You will receive voice input from the farmer, and your task is to extract the following information:
- Product Name
- Location
- Price
- Unit

Example Voice Input: \"Add Rice in India for ₹5 per kg\"

Based on the voice input, extract the information and populate the fields accordingly.

Voice Input: {{{voiceInput}}}
`,
});

const voiceProductUploadFlow = ai.defineFlow(
  {
    name: 'voiceProductUploadFlow',
    inputSchema: VoiceProductUploadInputSchema,
    outputSchema: VoiceProductUploadOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
