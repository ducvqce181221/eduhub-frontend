"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, SlidersHorizontal, RotateCcw } from "lucide-react";
import type { Category, CourseLevel } from "@/types/api";
import { cn } from "@/lib/utils";

interface CourseFiltersProps {
  categories: Category[];
  selectedCategory: string;
  selectedLevel: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onLevelChange: (level: CourseLevel | "") => void;
  onReset: () => void;
  className?: string;
}

const LEVELS: { label: string; value: CourseLevel | "" }[] = [
  { label: "All Levels", value: "" },
  { label: "Beginner", value: "BEGINNER" },
  { label: "Intermediate", value: "INTERMEDIATE" },
  { label: "Advanced", value: "ADVANCED" },
];

export function CourseFilters({
  categories,
  selectedCategory,
  selectedLevel,
  searchValue,
  onSearchChange,
  onCategoryChange,
  onLevelChange,
  onReset,
  className,
}: CourseFiltersProps) {
  const hasActiveFilters = Boolean(searchValue || selectedCategory || selectedLevel);

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {/* Search Bar & Reset */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
          <Input
            type="text"
            placeholder="Search courses by title or keyword..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-9 h-11 bg-surface border-hairline rounded-lg text-sm focus:border-notion-blue focus:ring-1 focus:ring-notion-blue shadow-2xs"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink rounded-full"
              aria-label="Clear search input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="h-11 px-4 rounded-lg border-hairline text-ink-muted hover:text-ink hover:bg-accent shrink-0 gap-1.5 w-full sm:w-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </Button>
        )}
      </div>

      {/* Filter Controls Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-hairline">
        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
          <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            Categories:
          </span>
          <Button
            variant={selectedCategory === "" ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange("")}
            className={cn(
              "h-8 rounded-full text-xs font-medium px-3 shrink-0 transition-colors",
              selectedCategory === ""
                ? "bg-notion-blue text-white border-notion-blue"
                : "border-hairline text-ink-secondary bg-surface hover:bg-canvas-soft",
            )}
          >
            All Categories
          </Button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <Button
                key={cat.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(cat.id)}
                className={cn(
                  "h-8 rounded-full text-xs font-medium px-3 shrink-0 transition-colors",
                  isSelected
                    ? "bg-notion-blue text-white border-notion-blue"
                    : "border-hairline text-ink-secondary bg-surface hover:bg-canvas-soft",
                )}
              >
                {cat.name}
              </Button>
            );
          })}
        </div>

        {/* Level Selector */}
        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider mr-1 shrink-0">
            Level:
          </span>
          <div className="inline-flex bg-canvas-soft p-1 rounded-lg border border-hairline">
            {LEVELS.map((lvl) => {
              const isSelected = selectedLevel === lvl.value;
              return (
                <button
                  key={lvl.label}
                  type="button"
                  onClick={() => onLevelChange(lvl.value)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                    isSelected
                      ? "bg-surface text-ink font-semibold shadow-2xs"
                      : "text-ink-muted hover:text-ink",
                  )}
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
