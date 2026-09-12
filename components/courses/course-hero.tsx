"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Layers,
  Shield,
  Users,
} from "lucide-react";
import { getLevelBadgeVariant } from "./course-card";
import { formatDuration } from "./curriculum-outline";
import { useTranslation } from "@/lib/i18n/language-context";
import { formatDate, translateCourseLevel } from "@/lib/i18n/formatters";
import type { Course } from "@/types/api";

interface CourseHeroProps {
  course: Course;
}

export function CourseHero({ course }: CourseHeroProps) {
  const { t, language } = useTranslation();
  const levelInfo = getLevelBadgeVariant(course.level);
  const initials = course.teacher?.fullName
    ? course.teacher.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ED";

  const chapterCount = course._count?.chapters ?? course.chapters?.length ?? 0;
  const lessonCount = (course.chapters || []).reduce(
    (acc, chap) => acc + (chap.lessons?.length || 0),
    0,
  );
  const totalDuration = (course.chapters || []).reduce((acc, chap) => {
    const chapSeconds = (chap.lessons || []).reduce(
      (sum, l) => sum + (l.video?.durationSeconds || 0),
      0,
    );
    return acc + chapSeconds;
  }, 0);
  const enrollmentCount = course._count?.enrollments ?? 0;

  const formattedDate = course.updatedAt || course.createdAt
    ? formatDate(course.updatedAt || course.createdAt!, "MMMM d, yyyy", language)
    : "Recently";

  const searchParams = useSearchParams();
  const { user } = useAuth();
  const isAdminFrom =
    searchParams?.get("from") === "admin" || user?.role === "ADMIN";

  return (
    <div className="w-full bg-surface border-b border-hairline pt-8 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Admin Navigation Banner / Return Link */}
        {isAdminFrom && (
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <Link
              href="/admin/courses"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-notion-blue hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.course.backToOversight}</span>
            </Link>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted bg-canvas-soft border border-hairline px-2 py-0.5 rounded-md">
              <Shield className="w-3 h-3 text-ink-secondary" />
              {t.course.adminPreview}
            </span>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-muted">
          <Link href="/" className="hover:text-ink transition-colors">
            {t.nav.home}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-ink-faint" />
          <Link href="/#catalog" className="hover:text-ink transition-colors">
            {t.nav.courses}
          </Link>
          {course.category?.name && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-ink-faint" />
              <Link
                href={`/courses?categoryId=${course.category.id}`}
                className="hover:text-ink transition-colors truncate max-w-37.5"
              >
                {course.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-ink-faint" />
          <span className="text-ink font-medium truncate max-w-50 sm:max-w-75">
            {course.title}
          </span>
        </nav>

        {/* Header Title & Badges */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {course.category?.name && (
              <Badge variant="secondary" className="text-xs px-2.5 py-0.5 bg-canvas-soft border-hairline font-medium">
                {course.category.name}
              </Badge>
            )}
            <Badge variant={levelInfo.variant} className="text-xs px-2.5 py-0.5 font-medium">
              {translateCourseLevel(course.level, t)}
            </Badge>
            {course.status === "DRAFT" && (
              <Badge variant="outline" className="text-xs px-2.5 py-0.5 border-sticker-orange text-sticker-orange-deep bg-sticker-orange/10 font-semibold">
                Draft Preview
              </Badge>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-ink tracking-tight leading-tight">
            {course.title}
          </h1>

          {course.description && (
            <p className="text-base text-ink-secondary max-w-4xl leading-relaxed">
              {course.description}
            </p>
          )}
        </div>

        {/* Instructor Info & Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-hairline text-xs sm:text-sm text-ink-muted">
          {/* Teacher Profile */}
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9 border border-hairline">
              {course.teacher?.avatarUrl && (
                <AvatarImage src={course.teacher.avatarUrl} alt={course.teacher.fullName} />
              )}
              <AvatarFallback className="bg-canvas-soft text-ink font-semibold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-ink-faint">{t.course.createdBy}</p>
              <p className="font-semibold text-ink leading-none mt-0.5">
                {course.teacher?.fullName || "EduHub Instructor"}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-ink-secondary">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-ink-muted" />
              <span>{t.course.updated.replace("{date}", formattedDate)}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-ink-muted" />
              <span>
                {chapterCount === 1
                  ? t.course.oneChapter
                  : t.course.chaptersCount.replace("{count}", String(chapterCount))}
              </span>
              {lessonCount > 0 && (
                <span className="text-ink-faint">
                  (
                  {lessonCount === 1
                    ? t.course.oneLesson
                    : t.course.totalLessons.replace("{count}", String(lessonCount))}
                  )
                </span>
              )}
            </div>

            {totalDuration > 0 && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-ink-muted" />
                <span>{formatDuration(totalDuration)}</span>
              </div>
            )}

            {enrollmentCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-ink-muted" />
                <span>{enrollmentCount} {enrollmentCount === 1 ? "learner" : "learners"}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
