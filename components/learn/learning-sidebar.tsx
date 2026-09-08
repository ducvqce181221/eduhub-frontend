"use client";

import React, { useState } from "react";
import { LocalizedLink } from "@/components/common/localized-link";
import { useTranslation } from "@/lib/i18n/language-context";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  HelpCircle,
  PlayCircle,
} from "lucide-react";
import type { Chapter } from "@/types/api";
import { formatDuration } from "@/components/courses/curriculum-outline";
import { cn } from "@/lib/utils";

interface LearningSidebarProps {
  courseId: string;
  courseTitle: string;
  chapters: Chapter[];
  activeLessonId: string;
  completedLessonIds?: string[];
  progressPercentage?: number;
  onSelectLesson?: (lessonId: string) => void;
  className?: string;
}

export function LearningSidebar({
  courseId,
  courseTitle,
  chapters,
  activeLessonId,
  completedLessonIds = [],
  progressPercentage = 0,
  onSelectLesson,
  className,
}: LearningSidebarProps) {
  const { t } = useTranslation();

  // Sort chapters
  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);

  // Flatten all lessons in order to calculate prev/next
  const allLessons = sortedChapters.flatMap((chap) =>
    [...(chap.lessons || [])].sort((a, b) => a.order - b.order),
  );

  const totalLessons = allLessons.length;
  const completedCount = completedLessonIds.length;
  const roundedProgress = Math.round(progressPercentage);

  // Find active lesson index
  const activeIndex = allLessons.findIndex((l) => l.id === activeLessonId);
  const prevLesson = activeIndex > 0 ? allLessons[activeIndex - 1] : null;
  const nextLesson = activeIndex >= 0 && activeIndex < allLessons.length - 1 ? allLessons[activeIndex + 1] : null;

  // Track expanded chapters
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(() => {
    // Expand chapter containing active lesson by default
    const currentChapter = sortedChapters.find((c) =>
      c.lessons?.some((l) => l.id === activeLessonId),
    );
    if (currentChapter) {
      return new Set([currentChapter.id]);
    }
    return sortedChapters.length > 0 ? new Set([sortedChapters[0].id]) : new Set();
  });

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-surface border border-hairline rounded-lg overflow-hidden shadow-notion-soft",
        className,
      )}
    >
      {/* Sidebar Header: Course Title & Progress Bar */}
      <div className="p-4 sm:p-5 border-b border-hairline bg-canvas-soft/60 flex flex-col gap-2.5">
        <LocalizedLink
          href={`/courses/${courseId}`}
          className="text-xs font-medium text-ink-muted hover:text-notion-blue transition-colors flex items-center gap-1.5 w-fit"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>{t.learn.backToOverview}</span>
        </LocalizedLink>

        <h2 className="text-sm sm:text-base font-bold text-ink leading-snug line-clamp-2">
          {courseTitle}
        </h2>

        {/* Progress bar */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-ink tabular-nums">
              {t.learn.percentComplete.replace("{progress}", String(roundedProgress))}
            </span>
            <span className="text-ink-muted tabular-nums">
              {t.learn.lessonsProgress.replace("{completed}", String(completedCount)).replace("{total}", String(totalLessons))}
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-canvas border border-hairline overflow-hidden">
            <div
              className="h-full bg-notion-blue rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, roundedProgress))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chapters & Lessons Scrollable Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-hairline">
        {sortedChapters.map((chapter) => {
          const isExpanded = expandedChapters.has(chapter.id);
          const sortedLessons = [...(chapter.lessons || [])].sort(
            (a, b) => a.order - b.order,
          );

          return (
            <div key={chapter.id} className="flex flex-col">
              {/* Chapter Header Button */}
              <button
                type="button"
                onClick={() => toggleChapter(chapter.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left bg-canvas-soft/40 hover:bg-canvas-soft transition-colors cursor-pointer"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-ink-muted shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-ink-muted shrink-0" />
                  )}
                  <span className="text-xs font-bold text-ink truncate leading-tight">
                    {chapter.title}
                  </span>
                </div>

                <span className="text-[11px] text-ink-muted shrink-0 tabular-nums font-mono">
                  {sortedLessons.length === 1
                    ? t.learn.oneLesson
                    : t.learn.lessonCount.replace("{count}", String(sortedLessons.length))}
                </span>
              </button>

              {/* Lessons in Chapter */}
              {isExpanded && (
                <div className="divide-y divide-hairline bg-surface">
                  {sortedLessons.map((lesson) => {
                    const isActive = lesson.id === activeLessonId;
                    const isCompleted = completedLessonIds.includes(lesson.id);
                    const duration = lesson.video?.durationSeconds;
                    const hasQuiz = Boolean(lesson.quiz);

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => onSelectLesson?.(lesson.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors cursor-pointer group",
                          isActive
                            ? "bg-notion-blue/5 border-l-2 border-notion-blue text-ink"
                            : "hover:bg-canvas-soft/60 text-ink-secondary",
                        )}
                      >
                        <div className="flex items-start gap-2.5 min-w-0 pr-2">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-sticker-teal shrink-0 mt-0.5" />
                          ) : isActive ? (
                            <PlayCircle className="w-4 h-4 text-notion-blue shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-4 h-4 text-ink-faint shrink-0 mt-0.5" />
                          )}

                          <div className="min-w-0">
                            <span
                              className={cn(
                                "text-xs leading-snug block truncate",
                                isActive ? "text-notion-blue-active font-semibold" : "text-ink font-medium",
                              )}
                            >
                              {lesson.title}
                            </span>

                            <div className="flex items-center gap-2 mt-0.5">
                              {duration !== undefined && duration > 0 && (
                                <span className="text-[11px] text-ink-muted font-mono tabular-nums flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  {formatDuration(duration)}
                                </span>
                              )}
                              {hasQuiz && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-sticker-teal/15 text-sticker-teal border-transparent font-medium">
                                  {t.course.quiz}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Prev / Next Lesson Footer Navigation */}
      <div className="p-3 border-t border-hairline bg-canvas-soft/70 flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={!prevLesson}
          onClick={() => prevLesson && onSelectLesson?.(prevLesson.id)}
          className={cn(
            "flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md border border-hairline transition-colors",
            prevLesson
              ? "bg-surface text-ink hover:bg-canvas-soft cursor-pointer"
              : "opacity-40 text-ink-muted cursor-not-allowed bg-transparent",
          )}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>{t.learn.previousLesson}</span>
        </button>

        <button
          type="button"
          disabled={!nextLesson}
          onClick={() => nextLesson && onSelectLesson?.(nextLesson.id)}
          className={cn(
            "flex items-center gap-1 text-xs font-medium px-3.5 py-1.5 rounded-md transition-colors",
            nextLesson
              ? "bg-notion-blue text-white hover:bg-notion-blue-active shadow-2xs cursor-pointer"
              : "opacity-40 text-ink-muted cursor-not-allowed bg-transparent border border-hairline",
          )}
        >
          <span>{t.learn.nextLesson}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
