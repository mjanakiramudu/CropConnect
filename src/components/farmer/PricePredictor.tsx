
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle, SearchCode, DollarSign } from "lucide-react";
import { fetchPricePrediction } from "@/app/actions";
import type { PricePredictorOutput } from "@/ai/flows/price-predictor-flow";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";

const commonUnits = ["kg", "quintal", "tonne", "pound", "gallon", "litre", "piece", "dozen", "bunch", "pack", "acre"];

export function PricePredictor() {
  const { user } = useAuth();
  const [location, setLocation] = useState(user?.location || "");
  const [productType, setProductType] = useState("");
  const [unit, setUnit] = useState("kg");
  const [marketInfo, setMarketInfo] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PricePredictorOutput | null>(null);
  const { translate } = useLanguage();

  const handleSubmit = async () => {
    if (!location.trim() || !productType.trim() || !unit.trim()) {
      setError(translate('pricePredictorFieldsError', "Location, Product Type, and Unit are required."));
      return;
    }
    setIsLoading(true);
    setError(null);
    setPrediction(null);

    const result = await fetchPricePrediction({ 
        location, 
        productType, 
        unit,
        currentMarketInfo: marketInfo.trim() || undefined 
    });

    if ("error" in result) {
      setError(result.error);
    } else {
      setPrediction(result);
    }
    setIsLoading(false);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <SearchCode className="mr-3 h-6 w-6 text-primary" />
          {translate('pricePredictorTitle', 'AI Price Predictor')}
        </CardTitle>
        <CardDescription>
          {translate('pricePredictorDesc', 'Get an AI-powered price suggestion for your produce.')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="product-type-input">{translate('productTypeLabel', 'Product Type (e.g., Tomatoes, Wheat)')}</Label>
                <Input
                id="product-type-input"
                placeholder={translate('productTypePlaceholder', "e.g., Organic Basmati Rice")}
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                disabled={isLoading}
                />
            </div>
            <div>
                <Label htmlFor="unit-select">{translate('unitForPricingLabel', 'Unit for Pricing')}</Label>
                <Select value={unit} onValueChange={setUnit} disabled={isLoading}>
                    <SelectTrigger id="unit-select">
                        <SelectValue placeholder={translate('selectUnitPlaceholder', "Select unit")} />
                    </SelectTrigger>
                    <SelectContent>
                        {commonUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>
         <div>
            <Label htmlFor="location-input-predictor">{translate('locationLabel', 'Location of Sale (Market, City)')}</Label>
            <Input
              id="location-input-predictor"
              placeholder={translate('locationPlaceholderPrice', "e.g., Azadpur Mandi, Delhi")}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isLoading}
            />
          </div>
           <div>
            <Label htmlFor="market-info-input">{translate('marketInfoLabel', 'Optional: Current Market Notes')}</Label>
            <Textarea
              id="market-info-input"
              placeholder={translate('marketInfoPlaceholder', "e.g., Last week sold for X, other farmers selling at Y")}
              value={marketInfo}
              onChange={(e) => setMarketInfo(e.target.value)}
              rows={2}
              disabled={isLoading}
            />
          </div>


        <Button onClick={handleSubmit} disabled={isLoading || !location.trim() || !productType.trim() || !unit.trim()} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <DollarSign className="mr-2 h-4 w-4" />
          )}
          {translate('getPriceSuggestionButton', 'Get Price Suggestion')}
        </Button>

        {error && (
          <div className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/30 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5"/>
            <p>{error}</p>
          </div>
        )}

        {prediction && !error && (
          <Card className="mt-4 p-4 bg-primary/5 border border-primary/20">
            <CardHeader className="p-0 pb-2">
                <CardTitle className="text-lg text-primary flex items-center">
                     <DollarSign className="mr-2 h-5 w-5"/>
                    {translate('aiPriceSuggestionTitle', 'AI Price Suggestion')}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-2 text-sm">
                <p><strong>{translate('suggestedRangeLabel', 'Suggested Range:')}</strong> <span className="font-semibold">{prediction.suggestedPriceRange}</span></p>
                <p><strong>{translate('reasoningLabel', 'Reasoning:')}</strong> {prediction.reasoning}</p>
                {prediction.confidence && <p><strong>{translate('confidenceLabel', 'Confidence:')}</strong> {prediction.confidence}</p>}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
