"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, CheckCircle2, PlayCircle } from "lucide-react";
import { getLevelBadgeVariant } from "@/components/courses/course-card";
import type { Enrollment } from "@/types/api";
import { cn } from "@/lib/utils";

interface EnrolledCourseCardProps {
  enrollment: Enrollment;
  progressPercentage?: number;
  completedLessons?: number;
  totalLessons?: number;
  className?: string;
}

export function EnrolledCourseCard({
  enrollment,
  progressPercentage = 0,
  completedLessons = 0,
  totalLessons = 0,
  className,
}: EnrolledCourseCardProps) {
  const course = enrollment.course;
  if (!course) return null;

  const levelInfo = getLevelBadgeVariant(course.level);
  const initials = course.teacher?.fullName
    ? course.teacher.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ED";

  const roundedProgress = Math.round(progressPercentage);
  const isCourseComplete = roundedProgress >= 100 || enrollment.status === "COMPLETED";

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-2xl bg-surface border border-hairline shadow-notion-soft hover:shadow-notion-elevated transition-all overflow-hidden p-5 sm:p-6 gap-5",
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        {/* Top Badges & Thumbnail Row */}
        <div className="flex items-start gap-4">
          <div className="relative aspect-video w-28 sm:w-36 rounded-xl overflow-hidden bg-canvas-soft border border-hairline shrink-0 flex items-center justify-center">
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center text-notion-blue">
                <BookOpen className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              {course.category?.name && (
                <Badge variant="secondary" className="text-[11px] px-2 py-0 bg-canvas-soft border-hairline text-ink-secondary">
                  {course.category.name}
                </Badge>
              )}
              <Badge variant={levelInfo.variant} className="text-[11px] px-2 py-0 font-medium">
                {levelInfo.label}
              </Badge>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-ink line-clamp-2 leading-snug">
              {course.title}
            </h3>

            {/* Instructor Info */}
            <div className="flex items-center gap-2 mt-0.5">
              <Avatar className="w-5 h-5 border border-hairline shrink-0">
                {course.teacher?.avatarUrl && (
                  <AvatarImage src={course.teacher.avatarUrl} alt={course.teacher.fullName} />
                )}
                <AvatarFallback className="text-[9px] bg-canvas-soft font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-ink-muted truncate">
                {course.teacher?.fullName || "EduHub Instructor"}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar Section */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-hairline">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-ink flex items-center gap-1.5">
              {isCourseComplete ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-sticker-teal" />
                  <span className="text-sticker-teal">Completed</span>
                </>
              ) : (
                <span>{roundedProgress}% Complete</span>
              )}
            </span>
            <span className="text-ink-muted">
              {completedLessons} / {totalLessons} lessons
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-canvas-soft border border-hairline overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isCourseComplete ? "bg-sticker-teal" : "bg-notion-blue",
              )}
              style={{ width: `${Math.min(100, Math.max(0, roundedProgress))}%` }}
            />
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <Button
        variant={isCourseComplete ? "secondary" : "pill"}
        size="default"
        className="w-full font-semibold shadow-2xs gap-2"
        asChild
      >
        <Link href={`/learn/${course.id}`}>
          <PlayCircle className="w-4 h-4" />
          <span>{isCourseComplete ? "Review Course" : "Resume Learning"}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-auto" />
        </Link>
      </Button>
    </div>
  );
}
