"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Send, Loader2, AlertTriangle } from "lucide-react";
import { processVoiceInput } from "@/app/actions";
import type { VoiceUploadResult } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface VoiceUploadProps {
  onDataProcessed: (data: VoiceUploadResult) => void;
}

export function VoiceUpload({ onDataProcessed }: VoiceUploadProps) {
  const [voiceInput, setVoiceInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<VoiceUploadResult | null>(null);
  const { translate } = useLanguage();

  // Placeholder for Web Speech API - not implemented in this step
  const [isListening, setIsListening] = useState(false);
  const handleToggleListening = () => {
    setIsListening(!isListening);
    // Actual speech recognition logic would go here
    if (!isListening) {
        setVoiceInput(translate('voicePlaceholderExample', "Example: 50 kg rice from Punjab at 25 rupees per kg"));
    } else {
        // setVoiceInput(""); // Clear when stopping if you want
    }
  };


  const handleSubmit = async () => {
    if (!voiceInput.trim()) {
      setError(translate('voiceInputEmptyError', "Please provide voice input or type the product details."));
      return;
    }
    setIsLoading(true);
    setError(null);
    setParsedData(null);

    const result = await processVoiceInput({ voiceInput });

    if ("error" in result) {
      setError(result.error);
    } else {
      setParsedData(result);
      // Call the callback to pass data to the parent (e.g., to prefill AddProductForm)
      onDataProcessed(result);
    }
    setIsLoading(false);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>{translate('voiceProductUploadTitle', 'Voice Product Upload')}</CardTitle>
        <CardDescription>
          {translate('voiceUploadDesc', 'Speak or type your product details. For example: "Add 50 kg of Rice from Punjab for ₹2500 total."')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="voice-input">{translate('productDetails', 'Product Details (Spoken/Typed)')}</Label>
          <div className="flex items-center space-x-2">
            <Textarea
              id="voice-input"
              placeholder={translate('voiceUploadPlaceholder', "e.g., Add 20 dozen organic eggs from Haryana for 100 rupees per dozen")}
              value={voiceInput}
              onChange={(e) => setVoiceInput(e.target.value)}
              rows={3}
              className="flex-grow"
              disabled={isLoading}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleListening}
              disabled={isLoading}
              title={isListening ? translate('stopListening', "Stop Listening") : translate('startListening', "Start Listening (mock)")}
            >
              <Mic className={`h-5 w-5 ${isListening ? 'text-destructive' : ''}`} />
            </Button>
          </div>
           {isListening && <p className="text-sm text-primary animate-pulse">{translate('listeningMock', "Listening... (Mock - type your input)")}</p>}
        </div>

        <Button onClick={handleSubmit} disabled={isLoading || !voiceInput.trim()} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          {translate('processInput', 'Process Input')}
        </Button>

        {error && (
          <div className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/30 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5"/>
            <p>{error}</p>
          </div>
        )}

        {parsedData && !error && (
          <div className="mt-4 p-4 rounded-md bg-primary/10 border border-primary/30">
            <h3 className="font-semibold text-lg mb-2 text-primary">{translate('parsedDetails', 'Parsed Details (AI Generated)')}</h3>
            <p><strong>{translate('productName', 'Product Name')}:</strong> {parsedData.productName}</p>
            <p><strong>{translate('location', 'Location')}:</strong> {parsedData.location}</p>
            <p><strong>{translate('price', 'Price')}:</strong> {parsedData.price}</p>
            <p><strong>{translate('unit', 'Unit')}:</strong> {parsedData.unit}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {translate('parsedDetailsNote', 'Please review these details. The form has been pre-filled. Add quantity, category, and description, then save.')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
