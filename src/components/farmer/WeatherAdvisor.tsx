
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle, CloudSun, Lightbulb, Volume2 } from "lucide-react";
import { fetchWeatherAdvice } from "@/app/actions";
import type { WeatherAdvisorOutput } from "@/ai/flows/farmer-weather-advisor-flow";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export function WeatherAdvisor() {
  const { user } = useAuth();
  const { language: currentLanguage, translate } = useLanguage();
  const [location, setLocation] = useState(user?.location || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advice, setAdvice] = useState<WeatherAdvisorOutput | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  

  const handleSubmit = async () => {
    if (!location.trim()) {
      setError(translate('locationRequiredError', "Please enter a location."));
      return;
    }
    setIsLoading(true);
    setError(null);
    setAdvice(null);
    if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }

    const result = await fetchWeatherAdvice({ location, language: currentLanguage });

    if ("error" in result) {
      setError(result.error);
    } else {
      setAdvice(result);
    }
    setIsLoading(false);
  };

  const handleReadAloudAdvice = () => {
    if (!advice || typeof window === "undefined" || !window.speechSynthesis) {
      setError(translate('speechNotSupportedError', "Text-to-speech is not supported in your browser."));
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `${translate('weatherSummaryTitle', 'Weather Summary')}. ${advice.weatherSummary}. ${translate('farmingInstructionsTitle', 'Farming Instructions')}. ${advice.farmingInstructions}. ${translate('monthlyOutlookTitle', 'Monthly Outlook')}. ${advice.monthlyOutlook}.`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const langCode = currentLanguage.split('-')[0];
    utterance.lang = langCode;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setError(null);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      if (event.error === 'interrupted' || event.error === 'canceled') {
        console.log(`Weather advice speech (lang: ${langCode}) was intentionally stopped.`);
        setIsSpeaking(false); // Ensure state is cleared
        return;
      }
      console.error(`Weather advice speech error (lang: ${langCode}):`, event.error, event);
      setError(translate('speechError', "Sorry, I couldn't read this aloud."));
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    };
  }, []);


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CloudSun className="mr-3 h-6 w-6 text-primary" />
          {translate('weatherAdvisorTitle', 'Weather Advisor')}
        </CardTitle>
        <CardDescription>
          {translate('weatherAdvisorDesc', 'Get weather-based farming advice for your location.')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location-input">{translate('enterLocationLabel', 'Enter Location (e.g., City, Region)')}</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="location-input"
              placeholder={translate('locationPlaceholderWeather', "e.g., Nagpur, India")}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-grow"
              disabled={isLoading}
            />
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={isLoading || !location.trim()} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          {translate('getAdviceButton', 'Get Advice')}
        </Button>

        {error && (
          <div className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/30 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5"/>
            <p>{error}</p>
          </div>
        )}

        {advice && !error && (
          <Card className="mt-4 p-4 bg-primary/5 border border-primary/20 space-y-3">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg mb-1 text-primary">{translate('weatherSummaryTitle', 'Weather Summary')}</h3>
            </div>
            <p className="text-sm">{advice.weatherSummary}</p>
            
            <h3 className="font-semibold text-lg mb-1 text-primary pt-2">{translate('farmingInstructionsTitle', 'Farming Instructions')}</h3>
            <p className="text-sm whitespace-pre-line">{advice.farmingInstructions}</p>
            
            <h3 className="font-semibold text-lg mb-1 text-primary pt-2">{translate('monthlyOutlookTitle', 'Monthly Outlook')}</h3>
            <p className="text-sm whitespace-pre-line">{advice.monthlyOutlook}</p>
            
            <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReadAloudAdvice}
                className="mt-3 w-full"
            >
                <Volume2 className="mr-2 h-4 w-4" /> 
                {isSpeaking ? translate('stopReading', 'Stop Reading') : translate('readAloud', 'Read Aloud')}
            </Button>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
