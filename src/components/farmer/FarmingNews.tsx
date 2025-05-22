
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, AlertTriangle, Newspaper, Volume2, Info } from "lucide-react";
import { fetchFarmingNews } from "@/app/actions";
import type { NewsItem } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export function FarmingNews() {
  const { user } = useAuth();
  const { language: currentLanguage, translate } = useLanguage();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [news, setNews] = useState<NewsItem[] | null>(null);
  const [speakingArticle, setSpeakingArticle] = useState<string | null>(null); // Holds the title of the article being spoken

  const farmerLocation = user?.location;
  const region = farmerLocation || "India"; // Default to India if user location not set

  const handleFetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNews(null);
    if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setSpeakingArticle(null);
    }

    const result = await fetchFarmingNews({ region, language: currentLanguage, count: 3 });

    if ("error" in result) {
      setError(result.error);
    } else {
      setNews(result.newsItems);
    }
    setIsLoading(false);
  }, [currentLanguage, region]); 
  
  useEffect(() => {
    handleFetchNews();
  }, [handleFetchNews]);


  const handleReadAloud = (textToSpeak: string, articleTitle: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setError(translate('speechNotSupportedError', "Text-to-speech is not supported in your browser."));
      return;
    }

    // If this article is already speaking, stop it.
    if (speakingArticle === articleTitle && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel(); // This will trigger onend or onerror for the current utterance.
      // The onend/onerror handler should setSpeakingArticle(null)
      return;
    }

    // If any other article is speaking, or if no article is speaking, stop current and start new.
    window.speechSynthesis.cancel(); // Stop any current speech.

    const fullText = `${articleTitle}. ${textToSpeak}`;
    const utterance = new SpeechSynthesisUtterance(fullText);
    const langCode = currentLanguage.split('-')[0];
    utterance.lang = langCode;
    // Note: Actual voice availability depends on user's OS/browser having installed voice packs for regional languages.

    utterance.onstart = () => {
      setSpeakingArticle(articleTitle);
      setError(null); // Clear previous errors when new speech starts
    };

    utterance.onend = () => {
      // Ensure this callback only clears state if it was this utterance that ended naturally.
      // If cancel() was called, speakingArticle might already be null or different.
      if (speakingArticle === articleTitle) {
        setSpeakingArticle(null);
      }
    };

    utterance.onerror = (event) => {
      // If the error is due to interruption (e.g., by clicking "Stop Reading" or starting a new article),
      // we don't want to show a user-facing error.
      if (event.error === 'interrupted') {
        console.log(`Speech for "${articleTitle}" (lang: ${langCode}) was intentionally interrupted.`);
        // State is typically cleared by the action that caused the interruption (e.g. new onstart, or explicit cancel).
        // We ensure speakingArticle is null if it was the one being interrupted.
        if (speakingArticle === articleTitle) {
            setSpeakingArticle(null);
        }
        return; 
      }

      // For other types of errors:
      console.error(`Speech synthesis error for "${articleTitle}" (lang: ${langCode}):`, event.error, event);
      // Only set error and clear speaking state if this error pertains to the article we *thought* was speaking.
      if (speakingArticle === articleTitle) {
        setError(translate('speechError', `Sorry, I couldn't read "${articleTitle}" aloud.`));
        setSpeakingArticle(null);
      }
    };
    
    window.speechSynthesis.speak(utterance);
  };
  
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setSpeakingArticle(null);
      }
    };
  }, []);


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Newspaper className="mr-3 h-6 w-6 text-primary" />
          {translate('farmingNewsTitle', 'Farming News')}
        </CardTitle>
        <CardDescription>
          {translate('farmingNewsDesc', `Latest agricultural updates for ${region} in ${currentLanguage}.`)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <p>{translate('loadingNews', 'Loading news...')}</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/30 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5"/>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && news && news.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Info className="mx-auto h-8 w-8 mb-2" />
            {translate('noNewsFound', 'No recent news found for your region/language.')}
          </div>
        )}

        {!isLoading && !error && news && news.length > 0 && (
          <div className="space-y-4">
            {news.map((item, index) => (
              <Card key={index} className="bg-background/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">{item.title}</CardTitle>
                   <CardDescription className="text-xs">
                    {item.source && `${translate('source', 'Source:')} ${item.source}`}
                    {item.source && item.publishedDate && " | "}
                    {item.publishedDate && `${translate('published', 'Published:')} ${new Date(item.publishedDate).toLocaleDateString()}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm pb-3">
                  <p className="leading-relaxed">{item.summary}</p>
                </CardContent>
                <CardFooter className="pt-0">
                   <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleReadAloud(item.summary, item.title)}
                  >
                    <Volume2 className="mr-2 h-4 w-4" /> 
                    {speakingArticle === item.title && window.speechSynthesis.speaking ? translate('stopReading', 'Stop Reading') : translate('readAloud', 'Read Aloud')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
       <CardFooter>
          <Button onClick={handleFetchNews} disabled={isLoading} className="w-full" variant="ghost">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Newspaper className="mr-2 h-4 w-4" />
            )}
            {translate('refreshNewsButton', 'Refresh News')}
          </Button>
        </CardFooter>
    </Card>
  );
}
