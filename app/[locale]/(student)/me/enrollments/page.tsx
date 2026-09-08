"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LocalizedLink } from "@/components/common/localized-link";
import { useTranslation } from "@/lib/i18n/language-context";
import { ensureLocale } from "@/lib/auth/redirect-utils";
import { useAuth } from "@/lib/auth/auth-context";
import { useMyEnrollmentsQuery } from "@/hooks/use-course-catalog";
import { useCourseProgressQuery } from "@/hooks/use-student-learning";
import { EnrolledCourseCard } from "@/components/enrollments/enrolled-course-card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Compass,
  GraduationCap,
} from "lucide-react";
import type { Enrollment } from "@/types/api";

function EnrolledCourseItemWrapper({ enrollment }: { enrollment: Enrollment }) {
  const { data: progress } = useCourseProgressQuery(enrollment.courseId);

  return (
    <EnrolledCourseCard
      enrollment={enrollment}
      progressPercentage={progress?.progressPercentage || 0}
      completedLessons={progress?.completedLessons || 0}
      totalLessons={progress?.totalLessons || (enrollment.course?._count?.chapters ? enrollment.course._count.chapters * 2 : 0)}
    />
  );
}

export default function MyEnrollmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const [search, setSearch] = useState("");

  const isStudent = user?.role === "STUDENT";
  const isTeacher = user?.role === "TEACHER";
  const isAdmin = user?.role === "ADMIN";

  // Redirect Admin and Teacher to their dedicated workspace
  useEffect(() => {
    if (isAdmin) {
      router.replace(ensureLocale("/admin", language));
    } else if (isTeacher) {
      router.replace(ensureLocale("/teacher", language));
    }
  }, [isAdmin, isTeacher, router, language]);

  const { data: enrollments = [], isLoading } = useMyEnrollmentsQuery(
    Boolean(user && isStudent),
  );

  const filteredEnrollments = enrollments.filter((e) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      e.course?.title.toLowerCase().includes(term) ||
      e.course?.category?.name.toLowerCase().includes(term) ||
      e.course?.teacher?.fullName.toLowerCase().includes(term)
    );
  });

  if (isAdmin || isTeacher) {
    return null;
  }

  return (
    <div className="flex flex-col flex-1 bg-canvas-soft">
      {/* Header Banner */}
      <section className="w-full bg-surface border-b border-hairline py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="inline-flex items-center gap-2">
                <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-semibold text-notion-blue bg-canvas-soft border-hairline">
                  <GraduationCap className="w-3.5 h-3.5 mr-1" />
                  <span>{t.student.studentWorkspace}</span>
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                {t.student.enrollmentsTitle}
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted">
                {t.student.enrollmentsSubtitle}
              </p>
            </div>

            <Button variant="pill" size="default" asChild className="gap-2 cursor-pointer">
              <LocalizedLink href="/courses">
                <Compass className="w-4 h-4" />
                <span>{t.catalog.allCourses}</span>
              </LocalizedLink>
            </Button>
          </div>

          {/* Quick Filter Search */}
          {isStudent && enrollments.length > 0 && (
            <div className="max-w-md w-full mt-2">
              <SearchInput
                placeholder={t.student.filterEnrolledPlaceholder}
                value={search}
                onSearch={setSearch}
                className="h-10 text-xs sm:text-sm"
              />
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8 flex-1">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="p-5 sm:p-6 rounded-lg bg-surface border border-hairline flex flex-col gap-4 animate-pulse shadow-notion-soft"
              >
                <div className="flex items-start gap-3.5">
                  <Skeleton className="w-28 sm:w-32 aspect-video rounded-md" />
                  <div className="flex flex-col gap-2 flex-1">
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-5 w-full rounded-md" />
                    <Skeleton className="h-3.5 w-24 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-lg border border-dashed border-hairline bg-surface">
            <div className="w-12 h-12 rounded-lg bg-canvas-soft border border-hairline flex items-center justify-center text-notion-blue mb-4">
              <BookOpen className="w-6 h-6" />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-ink mb-1.5">
              {t.student.noEnrollmentsYet}
            </h3>

            <p className="text-xs sm:text-sm text-ink-muted max-w-md mb-6 leading-relaxed">
              {t.student.exploreCatalogSubtitle}
            </p>

            <Button variant="pill" size="default" asChild className="px-6 cursor-pointer">
              <LocalizedLink href="/courses">
                <Compass className="w-4 h-4 mr-2" />
                <span>{t.student.browseCatalog}</span>
              </LocalizedLink>
            </Button>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-ink-muted">
              {t.student.noEnrolledMatching.replace("{search}", search)}
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={() => setSearch("")}
              className="mt-2 text-xs cursor-pointer"
            >
              {t.student.clearSearch}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEnrollments.map((enrollment) => (
              <EnrolledCourseItemWrapper
                key={enrollment.id}
                enrollment={enrollment}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
