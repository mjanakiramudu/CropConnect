
"use client";

import { useState, useEffect } from "react";
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
  const [speakingArticle, setSpeakingArticle] = useState<string | null>(null);

  const region = user?.location || "India"; // Default to India if user location not set

  const handleFetchNews = async () => {
    setIsLoading(true);
    setError(null);
    setNews(null);

    const result = await fetchFarmingNews({ region, language: currentLanguage, count: 3 });

    if ("error" in result) {
      setError(result.error);
    } else {
      setNews(result.newsItems);
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    // Automatically fetch news when the component mounts or language/region changes
    handleFetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage, region]); // Dependency array ensures re-fetch on language/region change


  const handleReadAloud = (text: string, title: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // If currently speaking this article, stop it
      if (speakingArticle === title && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setSpeakingArticle(null); // Clear speaking state
        return;
      }

      // If speaking another article, or not speaking, start this one
      window.speechSynthesis.cancel(); // Stop any previous speech immediately

      const utterance = new SpeechSynthesisUtterance(title + ". " + text);
      // Sets the language for speech synthesis. Quality/availability of regional voices depends on the user's OS/browser.
      utterance.lang = currentLanguage.split('-')[0]; 
      
      utterance.onstart = () => {
        setSpeakingArticle(title); // Set speaking state when speech actually starts
      };
      utterance.onend = () => {
        setSpeakingArticle(null); // Clear speaking state when speech ends
      };
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setError(translate('speechError', "Sorry, I couldn't read this aloud."));
        setSpeakingArticle(null); // Clear speaking state on error
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      setError(translate('speechNotSupportedError', "Text-to-speech is not supported in your browser."));
    }
  };

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
                    {(speakingArticle === item.title && typeof window !== 'undefined' && window.speechSynthesis.speaking) 
                        ? translate('stopReading', 'Stop Reading') 
                        : translate('readAloud', 'Read Aloud')}
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

