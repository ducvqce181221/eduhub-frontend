import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

import { cookies } from "next/headers";
import type { User, Category } from "@/types/api";
import { getCategories } from "@/lib/api/courses";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EduHub — Knowledge, Simplified",
  description:
    "EduHub is a clean, paper-calm learning management system connecting learners with expert instructors.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-canvas-soft text-ink font-sans selection:bg-notion-blue/20 selection:text-notion-blue">
        <Providers initialUser={initialUser} initialCategories={initialCategories}>
          <Header initialUser={initialUser} />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
