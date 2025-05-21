
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle, CloudSun, Lightbulb } from "lucide-react";
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
  

  const handleSubmit = async () => {
    if (!location.trim()) {
      setError(translate('locationRequiredError', "Please enter a location."));
      return;
    }
    setIsLoading(true);
    setError(null);
    setAdvice(null);

    const result = await fetchWeatherAdvice({ location, language: currentLanguage });

    if ("error" in result) {
      setError(result.error);
    } else {
      setAdvice(result);
    }
    setIsLoading(false);
  };

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
          <div className="mt-4 p-4 rounded-md bg-primary/5 border border-primary/20 space-y-3">
            <div>
                <h3 className="font-semibold text-lg mb-1 text-primary">{translate('weatherSummaryTitle', 'Weather Summary')}</h3>
                <p className="text-sm">{advice.weatherSummary}</p>
            </div>
            <div>
                <h3 className="font-semibold text-lg mb-1 text-primary">{translate('farmingInstructionsTitle', 'Farming Instructions')}</h3>
                <p className="text-sm whitespace-pre-line">{advice.farmingInstructions}</p>
            </div>
             <div>
                <h3 className="font-semibold text-lg mb-1 text-primary">{translate('monthlyOutlookTitle', 'Monthly Outlook')}</h3>
                <p className="text-sm whitespace-pre-line">{advice.monthlyOutlook}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

