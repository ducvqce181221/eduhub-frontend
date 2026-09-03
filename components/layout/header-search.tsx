"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const isHomePage = pathname === "/";
  const currentSearchParam = searchParams.get("search") || "";

  const [term, setTerm] = useState(currentSearchParam);

  // Sync input value if URL search param changes from outside (e.g. back button, filter reset)
  useEffect(() => {
    setTerm(currentSearchParam);
  }, [currentSearchParam]);

  // Debounce handler when on home page
  useEffect(() => {
    if (!isHomePage) return;

    // Don't update URL if term is identical to current param
    if (term === currentSearchParam) return;

    const timer = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (term.trim()) {
          params.set("search", term.trim());
        } else {
          params.delete("search");
        }
        params.set("page", "1"); // Reset pagination

        router.replace(`/?${params.toString()}#catalog`, { scroll: false });
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [term, isHomePage, currentSearchParam, searchParams, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = term.trim();

    if (isHomePage) {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      router.replace(`/?${params.toString()}#catalog`, { scroll: false });

      // Scroll to catalog grid
      const catalogEl = document.getElementById("catalog");
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // Navigate to home with search param
      const target = query
        ? `/?search=${encodeURIComponent(query)}#catalog`
        : `/#catalog`;
      router.push(target);
    }
  };

  const handleClear = () => {
    setTerm("");
    if (isHomePage) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("search");
      params.set("page", "1");
      router.replace(`/?${params.toString()}#catalog`, { scroll: false });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative w-full max-w-md lg:max-w-lg", className)}
      role="search"
    >
      <div className="relative flex items-center">
        <button
          type="submit"
          className="absolute left-3 p-0.5 text-ink-faint hover:text-ink transition-colors cursor-pointer"
          aria-label="Submit course search"
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
          placeholder="Search courses, topics, instructors..."
          className="w-full h-9 pl-9 pr-8 bg-canvas-soft hover:bg-black/5 focus:bg-surface border-hairline rounded-full text-xs sm:text-sm text-ink placeholder:text-ink-faint transition-all focus:border-notion-blue focus:ring-1 focus:ring-notion-blue"
        />

        {term && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 p-1 text-ink-muted hover:text-ink rounded-full transition-colors"
            aria-label="Clear search input"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </form>
  );
}
