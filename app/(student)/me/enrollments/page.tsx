"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { useMyEnrollmentsQuery } from "@/hooks/use-course-catalog";
import { useCourseProgressQuery } from "@/hooks/use-student-learning";
import { EnrolledCourseCard } from "@/components/enrollments/enrolled-course-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Compass,
  GraduationCap,
  LayoutDashboard,
  Search,
  ShieldCheck,
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
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const isStudent = user?.role === "STUDENT";
  const isTeacher = user?.role === "TEACHER";
  const isAdmin = user?.role === "ADMIN";

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
                  <span>Student Workspace</span>
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                My Enrolled Courses
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted">
                Track your active learning milestones, resume lessons, and complete assessments.
              </p>
            </div>

            <Button variant="pill" size="default" asChild className="gap-2 shadow-2xs">
              <Link href="/courses">
                <Compass className="w-4 h-4" />
                <span>Explore Catalog</span>
              </Link>
            </Button>
          </div>

          {/* Quick Filter Search */}
          {isStudent && enrollments.length > 0 && (
            <div className="relative max-w-md w-full mt-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
              <Input
                type="text"
                placeholder="Filter my enrolled courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 bg-surface border-hairline rounded-lg text-xs sm:text-sm"
              />
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8 flex-1">
        {/* Role-specific Notice for Teacher/Admin */}
        {isAdmin ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-hairline bg-surface shadow-notion-soft max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-sticker-purple/20 border border-transparent flex items-center justify-center text-sticker-purple-deep mb-4 shadow-2xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-ink mb-1.5">
              Administrator Account
            </h3>
            <p className="text-sm text-ink-muted mb-6 max-w-md leading-relaxed">
              You are signed in with an Administrator profile. Enrollments are specific to student accounts. You can inspect platform courses and users in the Admin Panel.
            </p>
            <Button variant="pill" size="default" asChild className="px-6">
              <Link href="/admin">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Open Admin Panel
              </Link>
            </Button>
          </div>
        ) : isTeacher ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-hairline bg-surface shadow-notion-soft max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-sticker-sky/20 border border-transparent flex items-center justify-center text-notion-blue-active mb-4 shadow-2xs">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-ink mb-1.5">
              Teacher Profile
            </h3>
            <p className="text-sm text-ink-muted mb-6 max-w-md leading-relaxed">
              You are signed in as an Instructor. You can create curriculum, upload lessons, and view student progress in the Teacher Dashboard.
            </p>
            <Button variant="pill" size="default" asChild className="px-6">
              <Link href="/teacher">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Open Teacher Dashboard
              </Link>
            </Button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="p-6 rounded-2xl bg-surface border border-hairline flex flex-col gap-4 animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <Skeleton className="w-28 aspect-video rounded-xl" />
                  <div className="flex flex-col gap-2 flex-1">
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-5 w-full rounded-md" />
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-hairline bg-surface/60">
            <div className="w-14 h-14 rounded-2xl bg-canvas-soft border border-hairline flex items-center justify-center text-notion-blue mb-4 shadow-2xs">
              <BookOpen className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-ink mb-1.5">
              You haven&apos;t enrolled in any courses yet
            </h3>

            <p className="text-sm text-ink-muted max-w-md mb-6 leading-relaxed">
              Explore our curated engineering and design catalog to start learning with video streams, quizzes, and automated progress milestones.
            </p>

            <Button variant="pill" size="default" asChild className="px-6 shadow-xs">
              <Link href="/courses">
                <Compass className="w-4 h-4 mr-2" />
                Browse Course Catalog
              </Link>
            </Button>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-ink-muted">
              No enrolled courses match &quot;{search}&quot;.
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={() => setSearch("")}
              className="mt-2 text-xs"
            >
              Clear search
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
