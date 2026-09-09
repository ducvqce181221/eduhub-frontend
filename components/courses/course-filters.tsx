"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { X, SlidersHorizontal, RotateCcw } from "lucide-react";
import type { Category, CourseLevel } from "@/types/api";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";

interface CourseFiltersProps {
  categories: Category[];
  selectedCategory: string;
  selectedLevel: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onLevelChange: (level: CourseLevel | "") => void;
  onReset: () => void;
  showSearch?: boolean;
  className?: string;
}

export function CourseFilters({
  categories,
  selectedCategory,
  selectedLevel,
  searchValue,
  onSearchChange,
  onCategoryChange,
  onLevelChange,
  onReset,
  showSearch = false,
  className,
}: CourseFiltersProps) {
  const { t } = useTranslation();
  const hasActiveFilters = Boolean(searchValue || selectedCategory || selectedLevel);

  const levels: { label: string; value: CourseLevel | "" }[] = useMemo(
    () => [
      { label: t.catalog.allLevels, value: "" },
      { label: t.enums.level.BEGINNER, value: "BEGINNER" },
      { label: t.enums.level.INTERMEDIATE, value: "INTERMEDIATE" },
      { label: t.enums.level.ADVANCED, value: "ADVANCED" },
    ],
    [t],
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-4 bg-surface p-4 sm:p-5 rounded-lg border border-hairline shadow-notion-soft",
        className,
      )}
    >
      {/* Optional Search Bar if showSearch is true */}
      {showSearch && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full">
            <SearchInput
              placeholder={t.catalog.searchFilterPlaceholder}
              value={searchValue}
              onSearch={onSearchChange}
              className="h-10 pl-10 pr-9 bg-canvas-soft border-hairline rounded-md text-sm"
            />
          </div>
        </div>
      )}

      {/* 1. Dedicated Categories Filter Row (Full width & wrapping) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-notion-blue" />
            <span>{t.catalog.categoriesFilterTitle}</span>
          </span>
          {categories.length > 0 && (
            <span suppressHydrationWarning className="text-[11px] text-ink-muted">
              {categories.length === 1
                ? t.catalog.oneTrack
                : t.catalog.tracksCount.replace("{count}", String(categories.length))}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <Button
            variant={selectedCategory === "" ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange("")}
            className={cn(
              "h-7 rounded-full text-xs font-medium px-3 shrink-0 transition-colors cursor-pointer",
              selectedCategory === ""
                ? "bg-notion-blue text-white border-notion-blue"
                : "border-hairline text-ink-secondary bg-surface hover:bg-canvas-soft",
            )}
          >
            {t.catalog.allCategories}
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
                  "h-7 rounded-full text-xs font-medium px-3 shrink-0 transition-colors cursor-pointer",
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
      </div>

      {/* 2. Dedicated Level Filter Row (Separated below Categories) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-hairline">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider shrink-0">
            {t.catalog.levelFilterTitle}:
          </span>
          <div className="inline-flex bg-canvas-soft p-0.5 rounded-md border border-hairline flex-wrap gap-0.5">
            {levels.map((lvl) => {
              const isSelected = selectedLevel === lvl.value;
              return (
                <button
                  key={lvl.label}
                  type="button"
                  onClick={() => onLevelChange(lvl.value)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-sm transition-all cursor-pointer",
                    isSelected
                      ? "bg-surface text-ink font-semibold shadow-notion-soft"
                      : "text-ink-muted hover:text-ink",
                  )}
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="h-7 text-xs px-2.5 rounded-md border-hairline text-ink-muted hover:text-ink hover:bg-canvas-soft gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t.catalog.resetFilters}</span>
          </Button>
        )}
      </div>

      {/* 3. Active Filter Chips Row */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-hairline text-xs">
          <span className="text-ink-muted font-medium">{t.common.filter}:</span>

          {searchValue && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-notion-blue/10 text-notion-blue border border-notion-blue/20">
              <span>{searchValue}</span>
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="p-0.5 hover:bg-notion-blue/20 rounded-full cursor-pointer"
                aria-label="Clear keyword filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-canvas-soft text-ink border border-hairline">
              <span>
                {categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}
              </span>
              <button
                type="button"
                onClick={() => onCategoryChange("")}
                className="p-0.5 hover:bg-canvas-muted rounded-full cursor-pointer"
                aria-label="Clear category filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedLevel && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-canvas-soft text-ink border border-hairline">
              <span>{t.enums.level[selectedLevel as CourseLevel] || selectedLevel}</span>
              <button
                type="button"
                onClick={() => onLevelChange("")}
                className="p-0.5 hover:bg-canvas-muted rounded-full cursor-pointer"
                aria-label="Clear level filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-6 text-xs px-2 text-ink-muted hover:text-ink hover:bg-canvas-soft rounded-md ml-auto gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t.catalog.resetFilters}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
