"use client";

import React, { Suspense } from "react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { useCoursesQuery, useCategoriesQuery } from "@/hooks/use-course-catalog";
import { CourseFilters } from "@/components/courses/course-filters";
import { CourseGrid } from "@/components/courses/course-grid";
import { Pagination } from "@/components/common/pagination";
import { BannerCarousel } from "@/components/home/banner-carousel";
import { FaqSection } from "@/components/home/faq-section";
import { useTranslation } from "@/lib/i18n/language-context";
import { Compass } from "lucide-react";
import type { CourseLevel } from "@/types/api";

const LIMIT = 9;

function HomeContent() {
  const { t } = useTranslation();

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

  const scrollToCatalog = () => {
    const catalogEl = document.getElementById("catalog");
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const hasActiveFilters = Boolean(search || categoryId || level);

  return (
    <div className="flex flex-col flex-1 bg-canvas-soft">
      {/* 1. Promotional Banner Carousel (Ratio 3:1) */}
      <BannerCarousel />

      {/* 2. Full Course Catalog Section */}
      <section
        id="catalog"
        className="w-full py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-16"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-notion-blue mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>{t.catalog.fullCurriculum}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              {t.catalog.allCourses}
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              {t.catalog.curriculumSubtitle}
            </p>
          </div>

          {!isLoadingCourses && (
            <div className="text-xs text-ink-muted self-start md:self-auto font-medium">
              {meta.total === 1
                ? t.catalog.showingOneCourse
                : t.catalog.showingCourses
                    .replace("{count}", String(courses.length))
                    .replace("{total}", String(meta.total))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8">
          {/* Filters Bar */}
          <CourseFilters
            categories={categories}
            selectedCategory={categoryId}
            selectedLevel={level}
            searchValue={search}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onLevelChange={handleLevelChange}
            onReset={handleResetFilters}
            showSearch={true}
          />

          {/* Courses Grid */}
          <CourseGrid
            courses={courses}
            isLoading={isLoadingCourses}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
          />

          {/* Pagination */}
          {!isLoadingCourses && meta.totalPages > 1 && (
            <div className="mt-4 border-t border-hairline pt-6">
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                total={meta.total}
                limit={meta.limit}
                onPageChange={(p) => {
                  setPage(p);
                  scrollToCatalog();
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* 3. Practical Knowledge FAQ Section */}
      <FaqSection />
    </div>
  );
}

function HomeCatalogSkeleton() {
  return (
    <div className="flex flex-col flex-1 bg-canvas-soft">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="w-full aspect-[2.8/1] sm:aspect-[3/1] min-h-[220px] rounded-xl bg-surface border border-hairline animate-pulse" />
      </div>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-8 w-48 rounded-md bg-neutral-200/80 animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 rounded-lg bg-surface border border-hairline animate-pulse" />
          <div className="h-64 rounded-lg bg-surface border border-hairline animate-pulse" />
          <div className="h-64 rounded-lg bg-surface border border-hairline animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeCatalogSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}

