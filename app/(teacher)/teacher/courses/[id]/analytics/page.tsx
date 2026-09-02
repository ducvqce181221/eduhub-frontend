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
      <div className="min-h-screen bg-[#f6f5f4] pb-20">
        {/* Header Skeleton */}
        <div className="sticky top-0 z-30 border-b border-neutral-200 bg-white px-4 py-3 sm:px-6">
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
              <div key={i} className="rounded-xl border border-neutral-200 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
                <Skeleton className="h-7 w-20 rounded-md" />
                <Skeleton className="h-3 w-40 rounded-md" />
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
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
    <div className="min-h-screen bg-[#f6f5f4] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-neutral-500 hover:text-neutral-900"
            >
              <Link href={`/teacher/courses/${course.id}/builder`}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Builder</span>
              </Link>
            </Button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-bold text-neutral-900 sm:text-lg">
                  {course.title}
                </h1>
                <span className="rounded bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-[#0075de]">
                  Analytics
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Track enrolled student progress rates and quiz comprehension.
              </p>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-md border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
          >
            <Link href={`/teacher/courses/${course.id}/builder`}>
              <Edit3 className="mr-1.5 h-3.5 w-3.5" />
              Edit Course
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200">
          <button
            type="button"
            onClick={() => setActiveTab("students")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "students"
                ? "border-[#0075de] text-[#0075de]"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Users className="h-4 w-4" />
            Enrolled Students ({students.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("quizzes")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "quizzes"
                ? "border-[#0075de] text-[#0075de]"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            Quiz Results ({quizResults.length})
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
