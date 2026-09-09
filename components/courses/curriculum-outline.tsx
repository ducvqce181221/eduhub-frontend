"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, PlayCircle, Play, FileText, HelpCircle, Clock, BookOpen, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/language-context";
import type { Chapter } from "@/types/api";
import { cn } from "@/lib/utils";


interface CurriculumOutlineProps {
  chapters: Chapter[];
  defaultExpanded?: boolean;
  showSummary?: boolean;
  className?: string;
  previewLessonId?: string;
  onPreviewLesson?: (lessonId: string) => void;
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0s";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  }
  return `${minutes}m ${secs.toString().padStart(2, "0")}s`;
}

export function CurriculumOutline({
  chapters,
  defaultExpanded = false,
  showSummary = false,
  className,
  previewLessonId,
  onPreviewLesson,
}: CurriculumOutlineProps) {

  // Sort chapters by order ascending
  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);

  // Initialize expanded state for chapters
  const [expandedChapterIds, setExpandedChapterIds] = useState<Set<string>>(() => {
    if (defaultExpanded) {
      return new Set(sortedChapters.map((c) => c.id));
    }
    // Expand the first chapter by default
    return sortedChapters.length > 0 ? new Set([sortedChapters[0].id]) : new Set();
  });

  const toggleChapter = (chapterId: string) => {
    setExpandedChapterIds((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedChapterIds(new Set(sortedChapters.map((c) => c.id)));
  };

  const collapseAll = () => {
    setExpandedChapterIds(new Set());
  };

  const { t } = useTranslation();

  // Summary metrics
  const totalChapters = sortedChapters.length;
  const totalLessons = sortedChapters.reduce(
    (acc, chap) => acc + (chap.lessons?.length || 0),
    0,
  );
  const totalDurationSeconds = sortedChapters.reduce((acc, chap) => {
    const chapSeconds = (chap.lessons || []).reduce(
      (sum, l) => sum + (l.video?.durationSeconds || 0),
      0,
    );
    return acc + chapSeconds;
  }, 0);


  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Summary Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
        <div>
          <h3 className="text-lg font-bold text-ink flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-notion-blue" />
            Course Curriculum
          </h3>
          {showSummary && (
            <p className="text-xs text-ink-muted mt-0.5">
              {totalChapters} {totalChapters === 1 ? "chapter" : "chapters"} • {totalLessons}{" "}
              {totalLessons === 1 ? "lesson" : "lessons"} • {formatDuration(totalDurationSeconds)} total length
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={expandAll}
            className="text-notion-blue hover:text-notion-blue-active font-medium cursor-pointer"
          >
            Expand all
          </button>
          <span className="text-ink-faint">•</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-ink-muted hover:text-ink font-medium cursor-pointer"
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* Chapters Accordion List */}
      <div className="flex flex-col gap-2.5">
        {sortedChapters.map((chapter) => {
          const isExpanded = expandedChapterIds.has(chapter.id);
          const sortedLessons = [...(chapter.lessons || [])].sort((a, b) => a.order - b.order);
          const chapterLessonCount = sortedLessons.length;
          const chapterDuration = sortedLessons.reduce(
            (acc, l) => acc + (l.video?.durationSeconds || 0),
            0,
          );

          return (
            <div
              key={chapter.id}
              className="rounded-lg border border-hairline bg-surface overflow-hidden shadow-notion-soft transition-colors"
            >
              {/* Chapter Header Bar */}
              <button
                type="button"
                onClick={() => toggleChapter(chapter.id)}
                className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left bg-canvas-soft/60 hover:bg-canvas-soft transition-colors cursor-pointer"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-4">
                  <div className="text-ink-muted shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-ink" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-ink" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-ink leading-tight block">
                      {chapter.title}
                    </span>
                    {chapter.description && (
                      <span className="text-xs text-ink-muted line-clamp-1 mt-0.5 block">
                        {chapter.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 text-xs text-ink-muted">
                  <span>
                    {chapterLessonCount} {chapterLessonCount === 1 ? "lesson" : "lessons"}
                  </span>
                  {chapterDuration > 0 && (
                    <span className="hidden sm:inline text-ink-faint">
                      • {formatDuration(chapterDuration)}
                    </span>
                  )}
                </div>
              </button>

              {/* Lessons List in Chapter */}
              {isExpanded && (
                <div className="divide-y divide-hairline border-t border-hairline bg-surface">
                  {sortedLessons.length === 0 ? (
                    <div className="p-4 text-xs text-ink-muted text-center italic">
                      No lessons published in this chapter yet.
                    </div>
                  ) : (
                    sortedLessons.map((lesson) => {
                      const resourceCount =
                        lesson._count?.resources ?? lesson.resources?.length ?? 0;
                      const hasQuiz = Boolean(lesson.quiz);
                      const duration = lesson.video?.durationSeconds;
                      const isPreviewable = Boolean(
                        (lesson.video?.isPreview || (previewLessonId && lesson.id === previewLessonId)) &&
                        onPreviewLesson,
                      );

                      return (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between py-2.5 px-4 sm:px-5 hover:bg-canvas-soft/50 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-3">
                            <PlayCircle className="w-4 h-4 text-notion-blue shrink-0" />
                            <div className="min-w-0">
                              <span className="text-xs sm:text-sm text-ink font-medium leading-tight block truncate">
                                {lesson.title}
                              </span>
                              {lesson.description && (
                                <span className="text-xs text-ink-muted line-clamp-1 mt-0.5 block">
                                  {lesson.description}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isPreviewable && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPreviewLesson?.(lesson.id);

                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-notion-blue bg-notion-blue/10 hover:bg-notion-blue/20 border border-notion-blue/30 transition-all cursor-pointer shadow-2xs"
                              >
                                <Play className="w-2.5 h-2.5 fill-current" />
                                <span>{t.course.previewBadge}</span>
                              </button>
                            )}

                            {hasQuiz && (
                              <Badge variant="teal" className="text-[11px] px-2 py-0.5 font-medium flex items-center gap-1">
                                <HelpCircle className="w-3 h-3" />
                                <span>Quiz</span>
                              </Badge>
                            )}

                            {resourceCount > 0 && (
                              <Badge variant="secondary" className="text-[11px] px-2 py-0.5 bg-canvas-soft text-ink-secondary border-hairline font-normal hidden sm:inline-flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                <span>{resourceCount} {resourceCount === 1 ? "resource" : "resources"}</span>
                              </Badge>
                            )}

                            {duration !== undefined && duration > 0 && (
                              <span className="text-xs text-ink-muted flex items-center gap-1">
                                <Clock className="w-3 h-3 text-ink-faint" />
                                <span>{formatDuration(duration)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );

                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
