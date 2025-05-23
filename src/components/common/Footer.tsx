
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

  // Initial text for server-render and first client-render pass
  // Using a fixed year string or a very stable default for the server can also help if Date() causes issues.
  // However, for consistency, let's calculate year and use defaults here.
  const initialYear = new Date().getFullYear(); // This will be consistent if server/client run "simultaneously"
  const initialText = `© ${initialYear} ${APP_NAME}. All rights reserved.`;

  const [footerText, setFooterText] = useState(initialText);

  useEffect(() => {
    if (isClient) {
      // This runs only on the client after hydration
      const currentYear = new Date().getFullYear();
      const appNameText = translate('appName', APP_NAME);
      const allRightsReservedText = translate('allRightsReserved', 'All rights reserved.');
      setFooterText(`© ${currentYear} ${appNameText}. ${allRightsReservedText}`);
    }
  }, [isClient, translate]);

  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:justify-center">
        {/* These class names match what the server was likely rendering previously with the copyright */}
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          {footerText}
        </p>
      </div>
    </footer>
  );
}
