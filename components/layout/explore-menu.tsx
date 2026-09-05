"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCategoriesQuery } from "@/hooks/use-course-catalog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutGrid,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ExploreMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: categories = [], isLoading } = useCategoriesQuery();

  const handleSelectCategory = (categoryId: string) => {
    setOpen(false);
    const targetUrl = `/?categoryId=${encodeURIComponent(categoryId)}#catalog`;
    router.push(targetUrl);

    // If already on home page, scroll directly into the catalog area
    if (pathname === "/") {
      const catalogEl = document.getElementById("catalog");
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleViewAll = () => {
    setOpen(false);
    router.push("/#catalog");
    if (pathname === "/") {
      const catalogEl = document.getElementById("catalog");
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-9 px-3 gap-2 font-medium text-sm text-ink-secondary hover:text-ink hover:bg-canvas-soft rounded-md transition-colors",
            open && "bg-canvas-soft text-ink font-semibold",
          )}
          aria-label="Explore course categories"
        >
          <LayoutGrid className="w-4 h-4 text-notion-blue" />
          <span>Explore</span>
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-ink-muted transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-90 sm:w-115 p-4 bg-surface border-hairline shadow-notion-dropdown rounded-lg z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline mb-3">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink">
              Course Categories
            </h4>
            <p className="text-[11px] text-ink-muted">
              Browse tracks by engineering domain
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewAll}
            className="text-xs h-7 text-notion-blue hover:text-notion-blue-active hover:bg-notion-blue/5 font-medium px-2 rounded-md"
          >
            All Courses
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-md bg-canvas-soft animate-pulse border border-hairline"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="py-6 text-center text-xs text-ink-muted">
            No active categories found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
            {categories.map((cat) => {
              const courseCount = (cat as any)._count?.courses ?? 0;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.id)}
                  className="group flex flex-col justify-center p-2.5 rounded-md border border-hairline hover:border-notion-blue/40 hover:bg-canvas-soft text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 w-full">
                    <span className="text-xs font-medium text-ink group-hover:text-notion-blue truncate">
                      {cat.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-4 shrink-0 font-normal bg-canvas-soft text-ink-muted group-hover:bg-notion-blue/10 group-hover:text-notion-blue border-hairline transition-colors"
                    >
                      {courseCount}
                    </Badge>
                  </div>

                  {cat.description && (
                    <p className="text-[11px] text-ink-muted line-clamp-1 mt-1">
                      {cat.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
