"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { translate } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Text that might be translated.
  // For the initial server render and the first client render (before useEffect runs),
  // we'll use the default English text to ensure consistency.
  const textToShow = isClient
    ? translate('connectingFarmers', 'Connecting Farmers and Customers Directly.')
    : 'Connecting Farmers and Customers Directly.';

  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:justify-center">
        <p className="text-center text-sm text-muted-foreground">
          {textToShow}
        </p>
      </div>
    </footer>
  );
}
