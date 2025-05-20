"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/lib/constants";

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  translate: (key: string, defaultText: string) => string;
}

// Basic translations store
const translations: Record<string, Record<string, string>> = {
  hi: {
    welcome: "स्वागत है",
    appName: "फार्मलिंक",
    farmer: "किसान",
    customer: "ग्राहक",
    login: "लॉग इन करें",
    register: "पंजीकरण करें",
    selectRole: "अपनी भूमिका चुनें",
    uploadProduct: "उत्पाद अपलोड करें",
    browseProducts: "उत्पाद ब्राउज़ करें",
    voiceUploadPrompt: "उत्पाद विवरण बोलें (जैसे '50 किलो चावल भारत में ₹2500 प्रति किलो')",
    addByForm: "फ़ॉर्म द्वारा जोड़ें",
    addByVoice: "आवाज से जोड़ें",
    productName: "उत्पाद का नाम",
    price: "कीमत",
    quantity: "मात्रा",
    location: "स्थान",
    unit: "इकाई",
    description: "विवरण",
    category: "श्रेणी",
    submit: "प्रस्तुत करें",
    speak: "बोलें",
    processing: "प्रोसेस हो रहा है...",
    confirmAndSave: "पुष्टि करें और सहेजें",
    searchProducts: "उत्पाद खोजें..."
  },
  te: {
    welcome: "స్వాగతం",
    appName: "ఫార్మ్‌లింక్",
    farmer: "రైతు",
    customer: "వినియోగదారుడు",
    login: "లాగిన్ చేయండి",
    register: "నమోదు చేసుకోండి",
    selectRole: "మీ పాత్రను ఎంచుకోండి",
    uploadProduct: "ఉత్పత్తిని అప్‌లోడ్ చేయండి",
    browseProducts: "ఉత్పత్తులను బ్రౌజ్ చేయండి",
    voiceUploadPrompt: "ఉత్పత్తి వివరాలను చెప్పండి (ఉదా. '50 కిలోల బియ్యం భారతదేశంలో ₹2500 ప్రతి కిలో')",
    addByForm: "ఫారం ద్వారా జోడించండి",
    addByVoice: "వాయిస్ ద్వారా జోడించండి",
    productName: "ఉత్పత్తి పేరు",
    price: "ధర",
    quantity: "పరిమాణం",
    location: "స్థలం",
    unit: "యూనిట్",
    description: "వివరణ",
    category: "వర్గం",
    submit: "సమర్పించండి",
    speak: "చెప్పండి",
    processing: "ప్రాసెస్ అవుతోంది...",
    confirmAndSave: "నిర్ధారించి సేవ్ చేయండి",
    searchProducts: "ఉత్పత్తుల కోసం శోధించండి..."
  },
  ta: {
    welcome: "வரவேற்கிறோம்",
    appName: "பார்ம்லிங்க்",
    farmer: "விவசாயி",
    customer: "வாடிக்கையாளர்",
    login: "உள்நுழையவும்",
    register: "பதிவு செய்யவும்",
    selectRole: "உங்கள் பங்கைத் தேர்ந்தெடுக்கவும்",
    uploadProduct: "பொருளைப் பதிவேற்றவும்",
    browseProducts: "பொருட்களை உலாவவும்",
    voiceUploadPrompt: "பொருள் விவரங்களைக் கூறவும் (எ.கா. '50 கிலோ அரிசி இந்தியாவில் ₹2500 ಪ್ರತಿ கிலோ')",
    addByForm: "படிவம் மூலம் சேர்க்கவும்",
    addByVoice: "குரல் மூலம் சேர்க்கவும்",
    productName: "பொருள் பெயர்",
    price: "விலை",
    quantity: "அளவு",
    location: "இடம்",
    unit: "அலகு",
    description: "விளக்கம்",
    category: "வகை",
    submit: "சமர்ப்பிக்கவும்",
    speak: "பேசுங்கள்",
    processing: "செயலாக்கத்தில் உள்ளது...",
    confirmAndSave: "உறுதிப்படுத்தி சேமிக்கவும்",
    searchProducts: "பொருட்களைத் தேடு..."
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<string>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const storedLang = localStorage.getItem("farmLinkLanguage");
    if (storedLang && SUPPORTED_LANGUAGES.find(l => l.code === storedLang)) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: string) => {
    if (SUPPORTED_LANGUAGES.find(l => l.code === lang)) {
      setLanguageState(lang);
      localStorage.setItem("farmLinkLanguage", lang);
    }
  };

  const translate = (key: string, defaultText: string) => {
    return translations[language]?.[key] || defaultText;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
