"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { useCoursesQuery, useCategoriesQuery } from "@/hooks/use-course-catalog";
import { useAuth } from "@/lib/auth/auth-context";
import { CourseFilters } from "@/components/courses/course-filters";
import { CourseGrid } from "@/components/courses/course-grid";
import { Pagination } from "@/components/common/pagination";
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  Compass,
  GraduationCap,
} from "lucide-react";
import type { CourseLevel } from "@/types/api";

const LIMIT = 9;

function HomeContent() {
  const { isAuthenticated, user } = useAuth();

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
      {/* 1. Hero Section */}
      <section className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium text-notion-blue bg-surface border border-hairline shadow-notion-soft">
            <span className="w-1.5 h-1.5 rounded-full bg-notion-blue" />
            <span>EduHub Learning Platform</span>
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-ink tracking-tight leading-tight mb-5">
          Master Modern Software Engineering, <br className="hidden sm:inline" />
          <span className="text-ink-muted">from Fundamentals to Production.</span>
        </h1>

        <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto mb-8 leading-relaxed">
          Structured courses designed for working engineers. High-definition video streaming, interactive assessments, and atomic progress tracking.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <Button
            size="lg"
            variant="pill"
            onClick={scrollToCatalog}
            className="h-11 px-7 gap-2 cursor-pointer"
          >
            <span>Explore Courses</span>
            <ArrowDown className="w-4 h-4" />
          </Button>

          {!isAuthenticated ? (
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-7 rounded-full border-hairline bg-surface hover:bg-canvas-soft text-ink"
              asChild
            >
              <Link href="/register">Get Started Free</Link>
            </Button>
          ) : user?.role === "ADMIN" ? (
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-7 rounded-full border-hairline bg-surface hover:bg-canvas-soft text-ink"
              asChild
            >
              <Link href="/admin">Admin Panel</Link>
            </Button>
          ) : user?.role === "TEACHER" ? (
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-7 rounded-full border-hairline bg-surface hover:bg-canvas-soft text-ink"
              asChild
            >
              <Link href="/teacher">Teacher Dashboard</Link>
            </Button>
          ) : (
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-7 rounded-full border-hairline bg-surface hover:bg-canvas-soft text-ink"
              asChild
            >
              <Link href="/me/enrollments">My Learning Dashboard</Link>
            </Button>
          )}
        </div>

        {/* Value Proposition Highlights: Notion Editorial Proof-Points */}
        <div className="border-t border-hairline pt-8 max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 text-center sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-hairline">
            <div className="sm:px-4 first:sm:pl-0">
              <div className="text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                Adaptive Streaming
              </div>
              <p className="text-xs text-ink-muted leading-normal">
                Lossless Cloudflare R2 video delivery with persistent playback resumes.
              </p>
            </div>

            <div className="pt-4 sm:pt-0 sm:px-4">
              <div className="text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                Atomic Assessments
              </div>
              <p className="text-xs text-ink-muted leading-normal">
                Single-choice quizzes graded instantly with precise formula verification.
              </p>
            </div>

            <div className="pt-4 sm:pt-0 sm:px-4 last:sm:pr-0">
              <div className="text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                Mastery Sync
              </div>
              <p className="text-xs text-ink-muted leading-normal">
                Strict 90% watch threshold and automated milestone progress completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Full Course Catalog Section */}
      <section
        id="catalog"
        className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-hairline scroll-mt-20"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-notion-blue mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Full Curriculum</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              All Courses
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Discover self-paced courses with structured lessons, downloadable resources, and quizzes.
            </p>
          </div>

          {!isLoadingCourses && (
            <div className="text-xs text-ink-muted self-start md:self-auto font-medium">
              Showing{" "}
              <span className="font-semibold text-ink">{courses.length}</span> of{" "}
              <span className="font-semibold text-ink">{meta.total}</span>{" "}
              {meta.total === 1 ? "course" : "courses"}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8">
          {/* Separated Filters Bar */}
          <CourseFilters
            categories={categories}
            selectedCategory={categoryId}
            selectedLevel={level}
            searchValue={search}
            onSearchChange={handleSearchChange}
            onCategoryChange={(catId) => {
              setCategoryId(catId || null);
              setPage(1);
            }}
            onLevelChange={handleLevelChange}
            onReset={handleResetFilters}
            showSearch={false}
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

      {/* 3. Teacher & Platform Call to Action */}
      <section className="w-full mt-8 py-16 px-4 sm:px-6 lg:px-8 bg-canvas-soft border-t border-hairline">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-lg bg-surface border border-hairline shadow-notion-soft p-8 sm:p-12 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-sticker-purple-deep bg-sticker-purple/20 border border-sticker-purple/30 mb-4">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Instructor Studio</span>
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mb-3">
              Share your expertise. Teach on EduHub.
            </h2>

            <p className="text-sm sm:text-base text-ink-muted max-w-xl mx-auto mb-8 leading-relaxed">
              Structure chapters, host high-definition video lessons with direct Cloudflare R2 storage, design interactive assessments, and track student milestones with atomic precision.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                variant="pill"
                className="px-8 cursor-pointer"
                asChild
              >
                {user?.role === "TEACHER" || user?.role === "ADMIN" ? (
                  <Link href="/teacher">Open Teacher Dashboard</Link>
                ) : (
                  <Link href="/register">Start Teaching Today</Link>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function HomeCatalogSkeleton() {
  return (
    <div className="flex flex-col flex-1 bg-canvas-soft">
      <section className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="h-6 w-36 rounded-full bg-neutral-200/80 animate-pulse mx-auto mb-6" />
        <div className="h-12 w-3/4 max-w-2xl rounded-lg bg-neutral-200/80 animate-pulse mx-auto mb-4" />
        <div className="h-5 w-full max-w-md rounded-md bg-neutral-200/60 animate-pulse mx-auto mb-8" />
        <div className="flex justify-center gap-3 mb-12">
          <div className="h-11 w-36 rounded-full bg-neutral-200/80 animate-pulse" />
          <div className="h-11 w-36 rounded-full bg-neutral-200/80 animate-pulse" />
        </div>
        <div className="border-t border-hairline pt-8 max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-16 rounded-md bg-neutral-200/50 animate-pulse" />
            <div className="h-16 rounded-md bg-neutral-200/50 animate-pulse" />
            <div className="h-16 rounded-md bg-neutral-200/50 animate-pulse" />
          </div>
        </div>
      </section>
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
