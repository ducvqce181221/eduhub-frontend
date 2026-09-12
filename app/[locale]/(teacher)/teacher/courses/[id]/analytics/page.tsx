"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  HelpCircle,
  Edit3,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EnrolledStudentsTable } from "@/components/teacher/enrolled-students-table";
import { QuizAnalyticsView } from "@/components/teacher/quiz-analytics-view";
import { getCourseById } from "@/lib/api/courses";
import {
  getCourseStudents,
  getCourseProgressMetrics,
  getCourseQuizResults,
} from "@/lib/api/teacher";
import { useTranslation } from "@/lib/i18n/language-context";
import type {
  Course,
  EnrolledStudentProgressItem,
  CourseAggregateProgress,
  CourseQuizResultItem,
} from "@/types/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CourseAnalyticsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const { t } = useTranslation();

  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<EnrolledStudentProgressItem[]>([]);
  const [metrics, setMetrics] = useState<CourseAggregateProgress | null>(null);
  const [quizResults, setQuizResults] = useState<CourseQuizResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"students" | "quizzes">("students");

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setIsLoading(true);
        const [c, s, m, q] = await Promise.all([
          getCourseById(courseId),
          getCourseStudents(courseId),
          getCourseProgressMetrics(courseId),
          getCourseQuizResults(courseId),
        ]);
        setCourse(c);
        setStudents(s);
        setMetrics(m);
        setQuizResults(q);
      } catch {
        // Handled
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, [courseId]);

  if (isLoading || !course) {
    return (
      <div className="min-h-[100dvh] bg-canvas pb-20">
        {/* Header Skeleton */}
        <div className="sticky top-0 z-30 border-b border-hairline bg-surface px-4 py-3 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-28 rounded-md" />
              <Skeleton className="h-6 w-48 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
          {/* Summary Cards Skeleton */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-hairline bg-surface p-5 space-y-3 shadow-notion-soft">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
                <Skeleton className="h-7 w-20 rounded-md" />
                <Skeleton className="h-3 w-40 rounded-md" />
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="rounded-lg border border-hairline bg-surface p-6 space-y-4 shadow-notion-soft">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-48 rounded-md" />
              <Skeleton className="h-8 w-60 rounded-md" />
            </div>
            <div className="space-y-3 pt-2">
              <Skeleton className="h-10 w-full rounded-md" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-canvas pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-hairline bg-surface px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-ink-muted hover:text-ink"
            >
              <Link href={`/teacher/courses/${course.id}/builder`}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">{t.teacher.backToBuilder}</span>
              </Link>
            </Button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-bold text-ink sm:text-lg">
                  {course.title}
                </h1>
                <span className="rounded bg-sticker-sky/15 px-2 py-0.5 text-[11px] font-semibold text-sticker-sky-deep border border-transparent">
                  {t.teacher.analyticsBadge}
                </span>
              </div>
              <p className="text-xs text-ink-muted">
                {t.teacher.analyticsSubtitle}
              </p>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-md border-hairline text-xs font-medium text-ink hover:bg-canvas-soft"
          >
            <Link href={`/teacher/courses/${course.id}/builder`}>
              <Edit3 className="mr-1.5 h-3.5 w-3.5" />
              {t.teacher.editCourse}
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-hairline">
          <button
            type="button"
            onClick={() => setActiveTab("students")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition cursor-pointer ${
              activeTab === "students"
                ? "border-notion-blue text-notion-blue"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            <Users className="h-4 w-4" />
            {t.teacher.tabEnrolledStudents.replace("{count}", String(students.length))}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("quizzes")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition cursor-pointer ${
              activeTab === "quizzes"
                ? "border-notion-blue text-notion-blue"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            {t.teacher.tabQuizResults.replace("{count}", String(quizResults.length))}
          </button>
        </div>

        {/* Tab View */}
        {activeTab === "students" && (
          <EnrolledStudentsTable
            students={students}
            metrics={metrics}
            isLoading={isLoading}
          />
        )}

        {activeTab === "quizzes" && (
          <QuizAnalyticsView
            quizResults={quizResults}
            course={course}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
