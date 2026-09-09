"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Layers, Users } from "lucide-react";
import type { Course, CourseLevel } from "@/types/api";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";
import { LocalizedLink } from "@/components/common/localized-link";

interface CourseCardProps {
  course: Course;
  className?: string;
}

export function getLevelBadgeVariant(level: CourseLevel) {
  switch (level) {
    case "BEGINNER":
      return { variant: "teal" as const };
    case "INTERMEDIATE":
      return { variant: "sky" as const };
    case "ADVANCED":
      return { variant: "purple" as const };
    default:
      return { variant: "secondary" as const };
  }
}

export function CourseCard({ course, className }: CourseCardProps) {
  const { t } = useTranslation();
  const levelVariant = getLevelBadgeVariant(course.level).variant;
  const levelLabel = t.enums.level[course.level] || course.level;

  const initials = course.teacher?.fullName
    ? course.teacher.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ED";

  const chapterCount = course._count?.chapters ?? course.chapters?.length ?? 0;
  const enrollmentCount = course._count?.enrollments ?? 0;

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-lg bg-surface border border-hairline hover:border-ink/20 shadow-notion-soft hover:shadow-notion-elevated transition-all duration-150 overflow-hidden",
        className,
      )}
    >
      <LocalizedLink
        href={`/courses/${course.id}`}
        className="absolute inset-0 z-10 focus:outline-hidden focus:ring-2 focus:ring-notion-blue rounded-lg"
        aria-label={t.course.viewCourseAria.replace("{title}", course.title)}
      >
        <span className="sr-only">
          {t.course.viewCourseAria.replace("{title}", course.title)}
        </span>
      </LocalizedLink>

      {/* Course Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-canvas-soft border-b border-hairline flex items-center justify-center">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover transition-opacity duration-200"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-canvas-soft p-6 text-ink-muted select-none">
            <div className="w-10 h-10 rounded-md bg-surface border border-hairline flex items-center justify-center text-ink-secondary mb-2">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-ink-muted">
              {course.category?.name || t.course.defaultTrack}
            </span>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          {course.category?.name && (
            <Badge
              variant="secondary"
              className="text-[11px] px-2 py-0.5 font-medium text-ink-secondary bg-canvas-soft border-hairline"
            >
              {course.category.name}
            </Badge>
          )}
          <Badge
            variant={levelVariant}
            className="text-[11px] px-2 py-0.5 font-medium"
          >
            {levelLabel}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-semibold text-ink line-clamp-2 leading-snug mb-1.5 group-hover:text-notion-blue transition-colors">
          {course.title}
        </h3>

        {/* Description snippet */}
        {course.description && (
          <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed mb-4">
            {course.description}
          </p>
        )}

        <div className="mt-auto pt-3.5 border-t border-hairline flex items-center justify-between">
          {/* Teacher Info */}
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="w-5 h-5 border border-hairline shrink-0">
              {course.teacher?.avatarUrl && (
                <AvatarImage
                  src={course.teacher.avatarUrl}
                  alt={course.teacher.fullName}
                />
              )}
              <AvatarFallback className="text-[9px] bg-canvas-soft text-ink font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-ink truncate max-w-30 sm:max-w-37.5">
              {course.teacher?.fullName || t.course.instructor}
            </span>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-3 text-xs text-ink-muted shrink-0">
            <div className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-ink-faint" />
              <span>
                {chapterCount === 1
                  ? t.course.oneChapter
                  : t.course.chaptersCount.replace("{count}", String(chapterCount))}
              </span>
            </div>
            {enrollmentCount > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-ink-faint" />
                <span>{enrollmentCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
