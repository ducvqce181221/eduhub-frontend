"use client";

import React, { Suspense } from "react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { useCoursesQuery, useCategoriesQuery } from "@/hooks/use-course-catalog";
import { CourseFilters } from "@/components/courses/course-filters";
import { CourseGrid } from "@/components/courses/course-grid";
import { Pagination } from "@/components/common/pagination";
import { Badge } from "@/components/ui/badge";
import { Compass } from "lucide-react";
import type { CourseLevel } from "@/types/api";

const LIMIT = 9;

function CoursesContent() {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({ shallow: true, throttleMs: 300 }),
  );
  const [categoryId, setCategoryId] = useQueryState(
    "categoryId",
    parseAsString.withDefault("").withOptions({ shallow: true }),
  );
  const [level, setLevel] = useQueryState(
    "level",
    parseAsString.withDefault("").withOptions({ shallow: true }),
  );
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true }),
  );

  const { data: categories = [] } = useCategoriesQuery();

  const { data: coursesData, isLoading: isLoadingCourses } = useCoursesQuery({
    page,
    limit: LIMIT,
    search: search || undefined,
    categoryId: categoryId || undefined,
    level: level ? (level as CourseLevel) : undefined,
  });

  const courses = coursesData?.items || [];
  const meta = coursesData?.meta || {
    page: 1,
    limit: LIMIT,
    total: 0,
    totalPages: 0,
  };

  const handleSearchChange = (val: string) => {
    setSearch(val || null);
    setPage(1);
  };

  const handleCategoryChange = (catId: string) => {
    setCategoryId(catId || null);
    setPage(1);
  };

  const handleLevelChange = (lvl: CourseLevel | "") => {
    setLevel(lvl || null);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch(null);
    setCategoryId(null);
    setLevel(null);
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || categoryId || level);

  return (
    <div className="flex flex-col flex-1 bg-canvas-soft">
      {/* Header Banner */}
      <section className="w-full bg-surface border-b border-hairline py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold text-notion-blue bg-canvas-soft border-hairline mb-4 shadow-2xs">
            <Compass className="w-3.5 h-3.5 mr-1.5 text-notion-blue" />
            <span>Curated Learning Paths</span>
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-ink tracking-tight leading-tight mb-3">
            Explore Engineering &amp; Design Courses
          </h1>

          <p className="text-sm sm:text-base text-ink-muted max-w-2xl leading-relaxed">
            Hands-on courses built by industry experts. Learn with high-definition video streaming, interactive assessments, and automated progress milestones.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        {/* Search & Filters */}
        <CourseFilters
          categories={categories}
          selectedCategory={categoryId}
          selectedLevel={level}
          searchValue={search}
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onLevelChange={handleLevelChange}
          onReset={handleResetFilters}
        />

        {/* Course Grid */}
        <CourseGrid
          courses={courses}
          isLoading={isLoadingCourses}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={handleResetFilters}
        />

        {/* Pagination */}
        {!isLoadingCourses && meta.totalPages > 1 && (
          <div className="mt-4 border-t border-hairline pt-4">
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              limit={meta.limit}
              onPageChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function CoursesCatalogSkeleton() {
  return (
    <div className="flex flex-col flex-1 bg-canvas-soft">
      {/* Header Banner Skeleton */}
      <section className="w-full bg-surface border-b border-hairline py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="h-6 w-36 rounded-full bg-neutral-200/80 animate-pulse mb-4" />
          <div className="h-10 w-96 max-w-full rounded-lg bg-neutral-200/80 animate-pulse mb-3" />
          <div className="h-5 w-full max-w-xl rounded-md bg-neutral-200/60 animate-pulse" />
        </div>
      </section>

      {/* Main Content Skeleton */}
      <main className="w-full max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        {/* Filter Bar Skeleton */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="h-10 w-full max-w-sm rounded-lg bg-neutral-200/70 animate-pulse" />
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
            <div className="h-9 w-20 rounded-full bg-neutral-200/80 animate-pulse" />
            <div className="h-9 w-24 rounded-full bg-neutral-200/80 animate-pulse" />
            <div className="h-9 w-24 rounded-full bg-neutral-200/80 animate-pulse" />
          </div>
        </div>

        {/* Grid Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-hairline bg-surface p-5 flex flex-col gap-4 shadow-notion-soft"
            >
              <div className="aspect-video w-full rounded-xl bg-neutral-200/70 animate-pulse" />
              <div className="flex flex-col gap-2">
                <div className="h-4 w-24 rounded-full bg-neutral-200/80 animate-pulse" />
                <div className="h-5 w-full rounded-md bg-neutral-200/80 animate-pulse" />
                <div className="h-4 w-3/4 rounded-md bg-neutral-200/60 animate-pulse" />
              </div>
              <div className="pt-2 mt-auto border-t border-hairline flex justify-between items-center">
                <div className="h-4 w-20 rounded-md bg-neutral-200/60 animate-pulse" />
                <div className="h-8 w-24 rounded-full bg-neutral-200/80 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<CoursesCatalogSkeleton />}>
      <CoursesContent />
    </Suspense>
  );
}
