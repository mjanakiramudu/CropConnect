
"use client";

import { APP_NAME } from "@/lib/constants";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { translate } = useLanguage();
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:justify-center">
        {/* Copyright line removed as per request */}
        <p className="text-center text-sm text-muted-foreground">
          {translate('connectingFarmers', 'Connecting Farmers and Customers Directly.')}
        </p>
      </div>
    </footer>
  );
}
