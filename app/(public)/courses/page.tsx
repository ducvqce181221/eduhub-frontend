"use client";

import React from "react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { useCoursesQuery, useCategoriesQuery } from "@/hooks/use-course-catalog";
import { CourseFilters } from "@/components/courses/course-filters";
import { CourseGrid } from "@/components/courses/course-grid";
import { Pagination } from "@/components/common/pagination";
import { Badge } from "@/components/ui/badge";
import { Compass, Sparkles } from "lucide-react";
import type { CourseLevel } from "@/types/api";

const LIMIT = 9;

export default function CoursesPage() {
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

  const { data: categories = [], isLoading: isLoadingCategories } = useCategoriesQuery();

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
