"use server";

import { voiceProductUpload as voiceProductUploadFlow } from "@/ai/flows/voice-product-upload";
import type { VoiceProductUploadInput, VoiceProductUploadOutput } from "@/ai/flows/voice-product-upload";

export async function processVoiceInput(input: VoiceProductUploadInput): Promise<VoiceProductUploadOutput | { error: string }> {
  try {
    // Validate input if necessary, though Zod does it in the flow
    if (!input.voiceInput || input.voiceInput.trim() === "") {
      return { error: "Voice input cannot be empty." };
    }
    
    const result = await voiceProductUploadFlow(input);
    return result;
  } catch (error) {
    console.error("Error in processVoiceInput action:", error);
    // Check if error is an instance of Error to safely access message
    if (error instanceof Error) {
        return { error: `Failed to process voice input: ${error.message}` };
    }
    return { error: "An unknown error occurred while processing voice input." };
  }
}
