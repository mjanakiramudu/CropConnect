
"use server";

import { voiceProductUpload as voiceProductUploadFlow } from "@/ai/flows/voice-product-upload";
import type { VoiceProductUploadInput, VoiceProductUploadOutput } from "@/ai/flows/voice-product-upload";

import { getWeatherAdvice as getWeatherAdviceFlow } from "@/ai/flows/farmer-weather-advisor-flow";
import type { WeatherAdvisorInput, WeatherAdvisorOutput } from "@/ai/flows/farmer-weather-advisor-flow";

import { getFarmingNews as getFarmingNewsFlow } from "@/ai/flows/farming-news-flow";
import type { FarmingNewsInput, FarmingNewsOutput } from "@/ai/flows/farming-news-flow";

import { getPricePrediction as getPricePredictionFlow } from "@/ai/flows/price-predictor-flow";
import type { PricePredictorInput, PricePredictorOutput } from "@/ai/flows/price-predictor-flow";

import { getSalesInsights as getSalesInsightsFlow } from "@/ai/flows/sales-insights-flow";
import type { SalesInsightsInput, SalesInsightsOutput } from "@/ai/flows/sales-insights-flow";


export async function processVoiceInput(input: VoiceProductUploadInput): Promise<VoiceProductUploadOutput | { error: string }> {
  try {
    if (!input.voiceInput || input.voiceInput.trim() === "") {
      return { error: "Voice input cannot be empty." };
    }
    const result = await voiceProductUploadFlow(input);
    return result;
  } catch (error) {
    console.error("Error in processVoiceInput action:", error);
    if (error instanceof Error) {
        return { error: `Failed to process voice input: ${error.message}` };
    }
    return { error: "An unknown error occurred while processing voice input." };
  }
}

export async function fetchWeatherAdvice(input: WeatherAdvisorInput): Promise<WeatherAdvisorOutput | { error: string }> {
  try {
    if (!input.location || input.location.trim() === "") {
      return { error: "Location cannot be empty." };
    }
    if (!input.language || input.language.trim() === "") {
      return { error: "Language must be specified for weather advice." };
    }
    const result = await getWeatherAdviceFlow(input);
    return result;
  } catch (error) {
    console.error("Error in fetchWeatherAdvice action:", error);
     if (error instanceof Error) {
        return { error: `Failed to fetch weather advice: ${error.message}` };
    }
    return { error: "An unknown error occurred while fetching weather advice." };
  }
}

export async function fetchFarmingNews(input: FarmingNewsInput): Promise<FarmingNewsOutput | { error: string }> {
  try {
    if (!input.region || input.region.trim() === "") {
      return { error: "Region cannot be empty for news fetching." };
    }
    if (!input.language || input.language.trim() === "") {
      return { error: "Language must be specified for news fetching." };
    }
    const result = await getFarmingNewsFlow(input);
    return result;
  } catch (error) {
    console.error("Error in fetchFarmingNews action:", error);
    if (error instanceof Error) {
        return { error: `Failed to fetch farming news: ${error.message}` };
    }
    return { error: "An unknown error occurred while fetching farming news." };
  }
}

export async function fetchPricePrediction(input: PricePredictorInput): Promise<PricePredictorOutput | { error: string }> {
  try {
    if (!input.location || input.location.trim() === "" || !input.productType || input.productType.trim() === "" || !input.unit || input.unit.trim() === "") {
      return { error: "Location, Product Type, and Unit are required for price prediction." };
    }
     if (!input.language || input.language.trim() === "") {
      return { error: "Language must be specified for price prediction." };
    }
    const result = await getPricePredictionFlow(input);
    return result;
  } catch (error) {
    console.error("Error in fetchPricePrediction action:", error);
    if (error instanceof Error) {
        return { error: `Failed to fetch price prediction: ${error.message}` };
    }
    return { error: "An unknown error occurred while fetching price prediction." };
  }
}

export async function fetchSalesInsights(input: SalesInsightsInput): Promise<SalesInsightsOutput | { error: string }> {
  try {
    if (!input.salesDataJson || input.salesDataJson.trim() === "") {
      return { error: "Sales data cannot be empty." };
    }
     if (!input.language || input.language.trim() === "") {
      return { error: "Language must be specified for sales insights." };
    }
    // Basic JSON validation
    try {
      JSON.parse(input.salesDataJson);
    } catch (e) {
      return { error: "Invalid JSON format for sales data." };
    }
    const result = await getSalesInsightsFlow(input);
    return result;
  } catch (error) {
    console.error("Error in fetchSalesInsights action:", error);
    if (error instanceof Error) {
        return { error: `Failed to fetch sales insights: ${error.message}` };
    }
    return { error: "An unknown error occurred while fetching sales insights." };
  }
}

