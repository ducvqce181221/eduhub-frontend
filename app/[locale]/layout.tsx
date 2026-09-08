import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

import { cookies } from "next/headers";
import type { User, Category } from "@/types/api";
import { getCategories } from "@/lib/api/courses";
import { locales, defaultLocale, isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : defaultLocale;
  const dict = getDictionary(locale);

  return {
    title: `${dict.common.appName} — ${dict.common.tagline}`,
    description:
      locale === "vi"
        ? "EduHub là nền tảng quản lý học tập tinh gọn, kết nối học viên và giảng viên chuyên nghiệp."
        : "EduHub is a clean, paper-calm learning management system connecting learners with expert instructors.",
    alternates: {
      languages: {
        en: "/en",
        vi: "/vi",
      },
    },
  };
}

export default async function LocaleRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : defaultLocale;
  const dictionary = getDictionary(locale);

  const cookieStore = await cookies();
  const userCookie = cookieStore.get("eduhub_user")?.value;
  let initialUser: User | null = null;
  if (userCookie) {
    try {
      initialUser = JSON.parse(decodeURIComponent(userCookie));
    } catch {
      initialUser = null;
    }
  }

  let initialCategories: Category[] = [];
  try {
    initialCategories = await getCategories(true);
  } catch {
    initialCategories = [];
  }

  return (
    <html lang={locale} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-canvas-soft text-ink font-sans selection:bg-notion-blue/20 selection:text-notion-blue">
        <Providers
          initialUser={initialUser}
          initialCategories={initialCategories}
          locale={locale}
          dictionary={dictionary}
        >
          <Header initialUser={initialUser} />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
