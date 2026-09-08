"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { en } from "./dictionaries/en";
import { vi } from "./dictionaries/vi";

export type Language = "en" | "vi";

type Dictionary = typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Dictionary;
}

const dictionaries: Record<Language, Dictionary> = {
  en,
  vi,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  defaultLanguage = "en",
}: {
  children: React.ReactNode;
  defaultLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);

  useEffect(() => {
    const stored = localStorage.getItem("eduhub_lang") as Language | null;
    if (stored && (stored === "en" || stored === "vi")) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("eduhub_lang", lang);
    document.cookie = `eduhub_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const toggleLanguage = () => {
    const next = language === "en" ? "vi" : "en";
    setLanguage(next);
  };

  const t = dictionaries[language] || dictionaries.en;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: "en" as Language,
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: en,
    };
  }
  return context;
}

export function useTranslation() {
  const { t, language } = useLanguage();
  return { t, language };
}
