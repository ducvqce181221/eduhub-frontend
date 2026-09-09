"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";
import { stripLocale } from "@/lib/auth/redirect-utils";

export function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { t, language } = useTranslation();

  const isHomePage = stripLocale(pathname || "/") === "/";
  const currentSearchParam = searchParams?.get("search") || "";

  const [term, setTerm] = useState(currentSearchParam);

  // Sync input value if URL search param changes from outside (e.g. back button, filter reset)
  useEffect(() => {
    setTerm(currentSearchParam);
  }, [currentSearchParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = term.trim();

    if (isHomePage) {
      startTransition(() => {
        const params = new URLSearchParams(searchParams?.toString() || "");
        if (query) {
          params.set("search", query);
        } else {
          params.delete("search");
        }
        params.set("page", "1");
        router.replace(`/${language}/?${params.toString()}#catalog`, { scroll: false });

        // Scroll to catalog grid
        const catalogEl = document.getElementById("catalog");
        if (catalogEl) {
          catalogEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    } else {
      // Navigate to home with search param
      const target = query
        ? `/${language}/?search=${encodeURIComponent(query)}#catalog`
        : `/${language}/#catalog`;
      router.push(target);
    }
  };

  const handleClear = () => {
    setTerm("");
    if (isHomePage) {
      startTransition(() => {
        const params = new URLSearchParams(searchParams?.toString() || "");
        params.delete("search");
        params.set("page", "1");
        router.replace(`/${language}/?${params.toString()}#catalog`, { scroll: false });
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative w-full", className)}>
      <div className="relative flex items-center w-full">
        <button
          type="submit"
          disabled={isPending}
          className="absolute left-3 text-ink-muted hover:text-ink transition-colors flex items-center justify-center cursor-pointer"
          aria-label="Submit search"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 text-notion-blue animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>

        <Input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={t.nav.searchPlaceholder}
          className="w-full h-9 pl-9 pr-8 bg-canvas-soft hover:bg-canvas-soft/80 focus:bg-surface border-hairline rounded-md text-xs sm:text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-notion-blue focus:ring-1 focus:ring-notion-blue [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
        />

        {term && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 p-1 text-ink-muted hover:text-ink rounded-full transition-colors cursor-pointer"
            aria-label="Clear search input"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </form>
  );
}
