
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { APP_NAME } from "@/lib/constants";

export function Footer() {
  const { translate } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentYear = new Date().getFullYear();
  
  // Default to non-translated or base values for server and initial client render
  const appNameText = isClient ? translate('appName', APP_NAME) : APP_NAME;
  const allRightsReservedText = isClient ? translate('allRightsReserved', 'All rights reserved.') : 'All rights reserved.';
  
  const footerText = `© ${currentYear} ${appNameText}. ${allRightsReservedText}`;

  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:justify-center">
        {/* Using class names observed from the server-rendered part of the hydration error diff */}
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          {footerText}
        </p>
      </div>
    </footer>
  );
}
