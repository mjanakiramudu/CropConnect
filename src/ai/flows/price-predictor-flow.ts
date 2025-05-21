
'use server';
/**
 * @fileOverview Predicts a reasonable price range for agricultural products.
 *
 * - getPricePrediction - Suggests a price range for a product in a given location and language.
 * - PricePredictorInput - The input type for the getPricePrediction function.
 * - PricePredictorOutput - The return type for the getPricePrediction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PricePredictorInputSchema = z.object({
  location: z.string().describe('The geographical location (e.g., city, region, market name) where the product will be sold.'),
  productType: z.string().describe('The type of agricultural product (e.g., "Tomatoes", "Wheat", "Organic Eggs", "Apples - Fuji variety"). Be as specific as possible.'),
  unit: z.string().describe('The unit of measurement for the price (e.g., "kg", "quintal", "dozen", "pound").'),
  currentMarketInfo: z.string().optional().describe('Optional: Any current market observations or information the farmer can provide (e.g., "local mandi price is X", "competitors selling at Y").'),
  language: z.string().describe('The desired language for the price suggestion (e.g., "English", "Hindi", "Telugu", "Tamil").'),
});
export type PricePredictorInput = z.infer<typeof PricePredictorInputSchema>;

const PricePredictorOutputSchema = z.object({
  suggestedPriceRange: z.string().describe('The suggested price range for the product per specified unit (e.g., "$2.50 - $3.00 per kg", "₹2000 - ₹2200 per quintal").'),
  reasoning: z.string().describe('A brief explanation of the factors considered for the price suggestion (e.g., demand, seasonality, regional averages, input costs).'),
  confidence: z.string().optional().describe('An optional confidence level for the prediction (e.g., "High", "Medium", "Low").'),
});
export type PricePredictorOutput = z.infer<typeof PricePredictorOutputSchema>;

export async function getPricePrediction(input: PricePredictorInput): Promise<PricePredictorOutput> {
  return pricePredictorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pricePredictorPrompt',
  input: {schema: PricePredictorInputSchema},
  output: {schema: PricePredictorOutputSchema},
  prompt: `You are an expert agricultural market price analyst.
A farmer needs a price suggestion for their product. Respond entirely in the language: {{{language}}}.

Details:
- Product Type: {{{productType}}}
- Location of Sale: {{{location}}}
- Unit for Pricing: {{{unit}}}
{{#if currentMarketInfo}}- Farmer's Market Notes: {{{currentMarketInfo}}}{{/if}}

Based on this information, provide the following in {{{language}}}:
1.  **Suggested Price Range**: A realistic price range (e.g., X to Y) per {{{unit}}} for {{{productType}}} in {{{location}}}.
2.  **Reasoning**: Briefly explain the key factors influencing this price suggestion. Consider aspects like:
    *   Typical market rates for this product in the region.
    *   Current season and potential impact on availability/demand.
    *   Quality implications (if inferable from product type, e.g., "organic").
    *   General economic conditions or specific market events if widely known.
    *   If farmer provided market notes, incorporate how they influenced your suggestion.
3.  **Confidence Level** (Optional): State a confidence level (High, Medium, Low) if you feel it's appropriate, based on the specificity of the information and typical price volatility.

Aim for practical and justifiable price guidance. If the product or location is very niche or obscure, acknowledge this and provide a best-effort estimate based on broader category/regional data, and set confidence to Low.
Ensure your entire response is in {{{language}}}.
`,
});

const pricePredictorFlow = ai.defineFlow(
  {
    name: 'pricePredictorFlow',
    inputSchema: PricePredictorInputSchema,
    outputSchema: PricePredictorOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
     if (!output) {
      throw new Error("Failed to get price prediction from AI model.");
    }
    return output;
  }
);

