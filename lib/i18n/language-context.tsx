"use client";

import React, { createContext, useContext, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "./config";
import { defaultLocale, LOCALE_COOKIE_KEY, isValidLocale } from "./config";
import type { Dictionary } from "./dictionaries/en";
import { en } from "./dictionaries/en";
import { vi } from "./dictionaries/vi";

export type Language = Locale;

interface LanguageContextType {
  language: Locale;
  t: Dictionary;
  setLanguage: (lang: Locale) => void;
  toggleLanguage: () => void;
  switchLanguage: (nextLocale: Locale) => void;
  isPending: boolean;
}

const dictionaries: Record<Locale, Dictionary> = {
  en,
  vi,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  locale = defaultLocale,
  dictionary,
}: {
  children: React.ReactNode;
  locale?: Locale;
  dictionary?: Dictionary;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeLocale = isValidLocale(locale) ? locale : defaultLocale;
  const t = dictionary || dictionaries[activeLocale] || en;

  const switchLanguage = (nextLocale: Locale) => {
    if (nextLocale === activeLocale) return;

    // Set persistence cookie
    document.cookie = `${LOCALE_COOKIE_KEY}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    try {
      localStorage.setItem("eduhub_lang", nextLocale);
    } catch {
      // ignore
    }

    // Replace current locale prefix in pathname
    if (!pathname) {
      router.push(`/${nextLocale}`);
      return;
    }

    const segments = pathname.split("/");
    if (segments[1] && isValidLocale(segments[1])) {
      segments[1] = nextLocale;
    } else {
      segments.splice(1, 0, nextLocale);
    }

    const newPath = segments.join("/") || "/";
    const queryString = searchParams?.toString();
    const targetUrl = queryString ? `${newPath}?${queryString}` : newPath;

    startTransition(() => {
      router.push(targetUrl);
    });
  };

  const toggleLanguage = () => {
    const next = activeLocale === "en" ? "vi" : "en";
    switchLanguage(next);
  };

  const setLanguage = (lang: Locale) => {
    switchLanguage(lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language: activeLocale,
        t,
        setLanguage,
        toggleLanguage,
        switchLanguage,
        isPending,
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
      language: defaultLocale,
      t: en,
      setLanguage: () => {},
      toggleLanguage: () => {},
      switchLanguage: () => {},
      isPending: false,
    };
  }
  return context;
}

export function useTranslation() {
  const { t, language, switchLanguage, setLanguage, toggleLanguage, isPending } = useLanguage();
  return { t, language, switchLanguage, setLanguage, toggleLanguage, isPending };
}
