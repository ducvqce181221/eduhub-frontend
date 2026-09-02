import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Layers, Users } from "lucide-react";
import type { Course, CourseLevel } from "@/types/api";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
  className?: string;
}

export function getLevelBadgeVariant(level: CourseLevel) {
  switch (level) {
    case "BEGINNER":
      return { variant: "teal" as const, label: "Beginner" };
    case "INTERMEDIATE":
      return { variant: "sky" as const, label: "Intermediate" };
    case "ADVANCED":
      return { variant: "purple" as const, label: "Advanced" };
    default:
      return { variant: "secondary" as const, label: level };
  }
}

export function CourseCard({ course, className }: CourseCardProps) {
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
  const enrollmentCount = course._count?.enrollments ?? 0;

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-xl bg-surface border border-hairline shadow-notion-soft hover:shadow-notion-elevated transition-all duration-200 hover:-translate-y-0.5 overflow-hidden",
        className,
      )}
    >
      <Link
        href={`/courses/${course.id}`}
        className="absolute inset-0 z-10 focus:outline-hidden focus:ring-2 focus:ring-notion-blue rounded-xl"
        aria-label={`View course: ${course.title}`}
      >
        <span className="sr-only">View course {course.title}</span>
      </Link>

      {/* Course Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-canvas-soft border-b border-hairline flex items-center justify-center">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-canvas-soft via-accent/30 to-canvas-soft p-6 text-ink-muted">
            <div className="w-12 h-12 rounded-xl bg-surface border border-hairline shadow-xs flex items-center justify-center text-notion-blue mb-2">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-ink-muted">{course.category?.name || "EduHub Course"}</span>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          {course.category?.name && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium text-ink-secondary bg-canvas-soft border-hairline">
              {course.category.name}
            </Badge>
          )}
          <Badge variant={levelInfo.variant} className="text-xs px-2 py-0.5 font-medium">
            {levelInfo.label}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-ink line-clamp-2 leading-snug mb-2 group-hover:text-notion-blue transition-colors">
          {course.title}
        </h3>

        {/* Description snippet */}
        {course.description && (
          <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed mb-4">
            {course.description}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-hairline flex items-center justify-between">
          {/* Teacher Info */}
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="w-6 h-6 border border-hairline shrink-0">
              {course.teacher?.avatarUrl && (
                <AvatarImage src={course.teacher.avatarUrl} alt={course.teacher.fullName} />
              )}
              <AvatarFallback className="text-[10px] bg-canvas-soft text-ink font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-ink truncate max-w-[110px] sm:max-w-[140px]">
              {course.teacher?.fullName || "Instructor"}
            </span>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-3 text-xs text-ink-muted shrink-0">
            <div className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>{chapterCount} {chapterCount === 1 ? "chapter" : "chapters"}</span>
            </div>
            {enrollmentCount > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{enrollmentCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
