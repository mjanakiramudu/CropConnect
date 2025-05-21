
'use server';
/**
 * @fileOverview Analyzes sales data to provide insights for farmers.
 *
 * - getSalesInsights - Generates insights and recommendations from sales data.
 * - SalesInsightsInput - The input type for the getSalesInsights function.
 * - SalesInsightsOutput - The return type for the getSalesInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define a schema for individual sales records expected in the JSON input
const SaleRecordSchema = z.object({
  productName: z.string(),
  quantitySold: z.number(),
  totalRevenue: z.number(),
  saleDate: z.string().describe("Date of sale in YYYY-MM-DD format"), // Or ISO string
  // Add other relevant fields like customerId, location if available in your data
});

const SalesInsightsInputSchema = z.object({
  salesDataJson: z.string().describe('A JSON string representing an array of sales records. Each record should include productName, quantitySold, totalRevenue, and saleDate.'),
  timePeriod: z.string().optional().describe('Optional: The time period the sales data covers (e.g., "Last 30 days", "Previous Quarter").'),
  farmerSpecificGoals: z.string().optional().describe('Optional: Any specific goals or questions the farmer has (e.g., "How to increase sales of product X?", "Is my pricing optimal?").'),
});
export type SalesInsightsInput = z.infer<typeof SalesInsightsInputSchema>;

const SalesInsightsOutputSchema = z.object({
  keyInsights: z.array(z.string()).describe('A list of 2-4 key insights derived from the sales data (e.g., "Product X is the top seller", "Sales dip on weekends").'),
  actionableRecommendations: z.array(z.string()).describe('A list of 2-3 actionable recommendations for the farmer (e.g., "Consider bundling Product A with Product B", "Increase stock of Product X before festival season").'),
  demandForecast: z.string().optional().describe('An optional brief forecast of demand for key products if patterns are observable.'),
  seasonalTrends: z.string().optional().describe('Optional notes on seasonal trends observed in the data.'),
  overallSummary: z.string().describe('A short overall summary of the sales performance.'),
});
export type SalesInsightsOutput = z.infer<typeof SalesInsightsOutputSchema>;

export async function getSalesInsights(input: SalesInsightsInput): Promise<SalesInsightsOutput> {
  // Basic validation of the JSON string before passing to the prompt
  try {
    const parsedData = JSON.parse(input.salesDataJson);
    if (!Array.isArray(parsedData)) {
      throw new Error("salesDataJson must be an array.");
    }
    // Optionally, further validate each item against SaleRecordSchema here if strictness is needed
  } catch (e: any) {
    throw new Error(`Invalid salesDataJson format: ${e.message}`);
  }
  return salesInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'salesInsightsPrompt',
  input: {schema: SalesInsightsInputSchema},
  output: {schema: SalesInsightsOutputSchema},
  prompt: `You are a highly skilled senior data analyst specializing in agricultural sales.
A farmer has provided their sales data and needs your expert analysis.

Sales Data (JSON format):
{{{salesDataJson}}}

{{#if timePeriod}}Time Period Covered: {{{timePeriod}}}{{/if}}
{{#if farmerSpecificGoals}}Farmer's Goals/Questions: {{{farmerSpecificGoals}}}{{/if}}

Analyze this data thoroughly and provide the following:
1.  **Overall Summary**: A brief (1-2 sentences) executive summary of the sales performance.
2.  **Key Insights**: Identify 2-4 critical insights from the data. These could be about top-performing products, sales trends over time, customer behavior (if inferable), or underperforming items. Be specific and data-driven.
3.  **Actionable Recommendations**: Suggest 2-3 practical and actionable steps the farmer can take based on your insights to improve sales, optimize inventory, or adjust pricing.
4.  **Demand Forecast** (Optional): If clear patterns emerge, provide a short demand forecast for 1-2 key products.
5.  **Seasonal Trends** (Optional): If applicable and observable from the data or typical for the products, comment on any seasonal trends.

Focus on clarity, conciseness, and the practical value of your analysis for the farmer.
If the sales data is sparse or limited, acknowledge this in your analysis and provide more general advice if specific trends are hard to discern.
Structure your response clearly with headings for each section.
`,
});

const salesInsightsFlow = ai.defineFlow(
  {
    name: 'salesInsightsFlow',
    inputSchema: SalesInsightsInputSchema,
    outputSchema: SalesInsightsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
     if (!output) {
      throw new Error("Failed to get sales insights from AI model.");
    }
    return output;
  }
);
