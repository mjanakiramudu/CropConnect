"use client";

import { APP_NAME } from "@/lib/constants";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { translate } = useLanguage();
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} {translate('appName', APP_NAME)}. {translate('allRightsReserved', 'All rights reserved.')}
        </p>
        <p className="text-center text-sm text-muted-foreground">
          {translate('connectingFarmers', 'Connecting Farmers and Customers Directly.')}
        </p>
      </div>
    </footer>
  );
}
