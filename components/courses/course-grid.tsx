"use client";

import React from "react";
import { CourseCard } from "./course-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SearchX, BookOpen } from "lucide-react";
import type { Course } from "@/types/api";
import { cn } from "@/lib/utils";

interface CourseGridProps {
  courses: Course[];
  isLoading?: boolean;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  className?: string;
}

export function CourseCardSkeleton() {
  return (
    <div className="flex flex-col rounded-lg bg-surface border border-hairline overflow-hidden shadow-notion-soft animate-pulse">
      {/* Thumbnail skeleton */}
      <Skeleton className="aspect-video w-full rounded-none" />

      {/* Content skeleton */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        <Skeleton className="h-5 w-4/5 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-2/3 rounded-md" />

        <div className="mt-auto pt-3.5 border-t border-hairline flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-md" />
          </div>
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function CourseGrid({
  courses,
  isLoading,
  hasActiveFilters,
  onResetFilters,
  className,
}: CourseGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
          className,
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <CourseCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-lg border border-dashed border-hairline bg-surface">
        <div className="w-12 h-12 rounded-lg bg-canvas-soft border border-hairline flex items-center justify-center text-ink-muted mb-4">
          {hasActiveFilters ? (
            <SearchX className="w-6 h-6 text-ink-muted" />
          ) : (
            <BookOpen className="w-6 h-6 text-notion-blue" />
          )}
        </div>

        <h3 className="text-base sm:text-lg font-semibold text-ink mb-1.5">
          {hasActiveFilters ? "No courses found" : "No courses published yet"}
        </h3>

        <p className="text-xs sm:text-sm text-ink-muted max-w-md mb-6 leading-relaxed">
          {hasActiveFilters
            ? "We couldn't find any courses matching your current search or filter criteria. Try adjusting your keywords or clearing filters."
            : "Explore back soon as instructors publish new high-quality courses with hands-on exercises and video modules."}
        </p>

        {hasActiveFilters && onResetFilters && (
          <Button
            variant="pill"
            size="sm"
            onClick={onResetFilters}
            className="px-5 cursor-pointer"
          >
            Clear all filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
        className,
      )}
    >
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
