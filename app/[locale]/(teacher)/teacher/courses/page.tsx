"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, BookOpen } from "lucide-react";
import { TeacherCoursesHeader } from "@/components/teacher/teacher-courses-header";
import { TeacherCourseCard } from "@/components/teacher/teacher-course-card";
import { CreateCourseDialog } from "@/components/teacher/create-course-dialog";
import {
  PublishChecklistModal,
  type PublishChecklistState,
} from "@/components/teacher/publish-checklist-modal";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getMyCourses,
  createCourse,
  publishCourse,
  unpublishCourse,
  archiveCourse,
} from "@/lib/api/teacher";
import { getCategories } from "@/lib/api/courses";
import { useTranslation } from "@/lib/i18n/language-context";
import type { Course, Category, CreateCoursePayload } from "@/types/api";

export default function TeacherCoursesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED">("ALL");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [checklistState, setChecklistState] = useState<PublishChecklistState>({
    hasMetadata: true,
    hasChapters: true,
    hasLessons: true,
    hasVideos: true,
    hasValidQuizzes: true,
    details: [],
  });
  const [activeCourseIdForChecklist, setActiveCourseIdForChecklist] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [fetchedCourses, fetchedCategories] = await Promise.all([
        getMyCourses(),
        getCategories(true),
      ]);
      setCourses(fetchedCourses);
      setCategories(fetchedCategories);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCourse = async (payload: CreateCoursePayload) => {
    const created = await createCourse(payload);
    router.push(`/teacher/courses/${created.id}/builder`);
  };

  const handlePublish = async (courseId: string) => {
    const target = courses.find((c) => c.id === courseId);
    if (!target) return;

    try {
      await publishCourse(courseId);
      await loadData();
    } catch (err: any) {
      const errorMsg = Array.isArray(err?.message) ? err.message : [err?.message || "Course is not ready for publishing"];

      const hasMetadata = Boolean(target.title && target.description && target.thumbnailUrl && target.categoryId && target.level);
      const hasChapters = Boolean(target.chapters && target.chapters.length > 0);
      const hasLessons = Boolean(
        target.chapters && target.chapters.length > 0 && target.chapters.every((ch) => ch.lessons && ch.lessons.length > 0)
      );
      const hasVideos = Boolean(
        target.chapters && target.chapters.every((ch) => ch.lessons?.every((l) => l.video && l.video.durationSeconds > 0))
      );
      const hasValidQuizzes = true;

      setChecklistState({
        hasMetadata,
        hasChapters,
        hasLessons,
        hasVideos,
        hasValidQuizzes,
        details: errorMsg,
      });
      setActiveCourseIdForChecklist(courseId);
      setChecklistModalOpen(true);
    }
  };

  const handleUnpublish = async (courseId: string) => {
    await unpublishCourse(courseId);
    await loadData();
  };

  const handleArchive = async (courseId: string) => {
    await archiveCourse(courseId);
    await loadData();
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [courses, searchQuery, statusFilter]);

  return (
    <div className="min-h-dvh bg-canvas pb-16 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header with New Course Trigger */}
        <TeacherCoursesHeader
          totalCourses={courses.length}
          onNewCourse={() => setIsCreateOpen(true)}
        />

        {/* Filter and Search Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-4">
          {/* Status Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {([
              { key: "ALL", label: t.teacher.filterAll },
              { key: "DRAFT", label: t.teacher.filterDraft },
              { key: "PUBLISHED", label: t.teacher.filterPublished },
              { key: "ARCHIVED", label: t.teacher.filterArchived },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${statusFilter === key
                    ? "bg-notion-blue text-white shadow-2xs"
                    : "bg-surface text-ink-secondary hover:bg-canvas-soft border border-hairline"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="w-full max-w-xs">
            <SearchInput
              value={searchQuery}
              onSearch={setSearchQuery}
              placeholder={t.teacher.searchCoursesPlaceholder}
              size="sm"
            />
          </div>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 rounded-lg border border-hairline bg-surface p-4">
                <Skeleton className="h-36 w-full rounded-md" />
                <Skeleton className="mt-4 h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="rounded-lg border border-hairline bg-surface p-12 text-center shadow-notion-soft">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-canvas-soft text-ink-muted border border-hairline">
              <BookOpen className="h-6 w-6 stroke-1" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-ink">
              {t.teacher.noCoursesFound}
            </h3>
            <p className="mt-1 text-xs text-ink-muted">
              {searchQuery || statusFilter !== "ALL"
                ? t.teacher.noCoursesFilterHint
                : t.teacher.noCoursesEmptyHint}
            </p>
            {!searchQuery && statusFilter === "ALL" && (
              <Button
                variant="pill"
                size="default"
                onClick={() => setIsCreateOpen(true)}
                className="mt-5 px-5 shadow-xs"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                {t.teacher.createFirstCourse}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <TeacherCourseCard
                key={course.id}
                course={course}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
                onArchive={handleArchive}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Course Dialog */}
      <CreateCourseDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateCourse}
        categories={categories}
      />

      {/* Publish Checklist Modal (BR-CRS-02) */}
      <PublishChecklistModal
        isOpen={checklistModalOpen}
        onClose={() => setChecklistModalOpen(false)}
        onFixSection={(section) => {
          if (activeCourseIdForChecklist) {
            router.push(`/teacher/courses/${activeCourseIdForChecklist}/builder?tab=${section}`);
          }
        }}
        checklist={checklistState}
      />
    </div>
  );
}
