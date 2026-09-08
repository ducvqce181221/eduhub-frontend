"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth/auth-context";
import { Toaster } from "sonner";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { Category, User } from "@/types/api";
import { COURSE_QUERY_KEYS } from "@/hooks/use-course-catalog";
import { ThemeProvider } from "@/lib/theme/theme-context";
import { LanguageProvider } from "@/lib/i18n/language-context";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export function Providers({
  children,
  initialUser = null,
  initialCategories = [],
  locale = "en",
  dictionary,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
  initialCategories?: Category[];
  locale?: Locale;
  dictionary?: Dictionary;
}) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    });

    if (initialCategories && initialCategories.length > 0) {
      client.setQueryData(COURSE_QUERY_KEYS.categories, initialCategories);
    }

    return client;
  });

  return (
    <ThemeProvider defaultTheme="light">
      <LanguageProvider locale={locale} dictionary={dictionary}>
        <NuqsAdapter>
          <QueryClientProvider client={queryClient}>
            <AuthProvider initialUser={initialUser}>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </AuthProvider>
          </QueryClientProvider>
        </NuqsAdapter>
      </LanguageProvider>
    </ThemeProvider>
  );
}
