"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Layers,
  Settings,
  BarChart2,
  Loader2,
} from "lucide-react";
import { CourseBuilderHeader } from "@/components/teacher/course-builder-header";
import { CourseMetadataEditor } from "@/components/teacher/course-metadata-editor";
import { CurriculumTree } from "@/components/teacher/curriculum-tree";
import { LessonDrawer } from "@/components/teacher/lesson-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PublishChecklistModal,
  type PublishChecklistState,
} from "@/components/teacher/publish-checklist-modal";
import { getCourseById, getCategories } from "@/lib/api/courses";
import {
  updateCourse,
  publishCourse,
  unpublishCourse,
  archiveCourse,
} from "@/lib/api/teacher";
import {
  createChapter,
  updateChapter,
  deleteChapter,
  reorderChapters,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
} from "@/lib/api/curriculum";
import type {
  Course,
  Category,
  Lesson,
  UpdateCoursePayload,
  CreateChapterPayload,
  UpdateChapterPayload,
  CreateLessonPayload,
  UpdateLessonPayload,
  ReorderPayload,
} from "@/types/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CourseBuilderPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [course, setCourse] = useState<Course | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Active tab: curriculum | metadata
  const initialTab = searchParams.get("tab") === "metadata" ? "metadata" : "curriculum";
  const [activeTab, setActiveTab] = useState<"curriculum" | "metadata">(initialTab);

  // Lesson Drawer
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isLessonDrawerOpen, setIsLessonDrawerOpen] = useState(false);

  // Publish Checklist Modal
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [checklistState, setChecklistState] = useState<PublishChecklistState>({
    hasMetadata: true,
    hasChapters: true,
    hasLessons: true,
    hasVideos: true,
    hasValidQuizzes: true,
    details: [],
  });

  const loadCourseData = async () => {
    try {
      const [fetchedCourse, fetchedCategories] = await Promise.all([
        getCourseById(courseId),
        getCategories(true),
      ]);
      setCourse(fetchedCourse);
      setCategories(fetchedCategories);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const handleUpdateCourseMetadata = async (payload: UpdateCoursePayload) => {
    setIsSaving(true);
    try {
      const updated = await updateCourse(courseId, payload);
      setCourse((prev) => (prev ? { ...prev, ...updated } : updated));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!course) return;

    try {
      const published = await publishCourse(courseId);
      setCourse((prev) => (prev ? { ...prev, ...published } : published));
    } catch (err: any) {
      const errorMsg = Array.isArray(err?.message) ? err.message : [err?.message || "Checklist not met"];
      const hasMetadata = Boolean(course.title && course.description && course.thumbnailUrl && course.categoryId && course.level);
      const hasChapters = Boolean(course.chapters && course.chapters.length > 0);
      const hasLessons = Boolean(
        course.chapters && course.chapters.length > 0 && course.chapters.every((ch) => ch.lessons && ch.lessons.length > 0)
      );
      const hasVideos = Boolean(
        course.chapters && course.chapters.every((ch) => ch.lessons?.every((l) => l.video && l.video.durationSeconds > 0))
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
      setChecklistOpen(true);
    }
  };

  const handleUnpublish = async () => {
    const unpublished = await unpublishCourse(courseId);
    setCourse((prev) => (prev ? { ...prev, ...unpublished } : unpublished));
  };

  const handleArchive = async () => {
    const archived = await archiveCourse(courseId);
    setCourse((prev) => (prev ? { ...prev, ...archived } : archived));
  };

  // Chapter Handlers
  const handleAddChapter = async (payload: CreateChapterPayload) => {
    await createChapter(courseId, payload);
    await loadCourseData();
  };

  const handleUpdateChapter = async (chapterId: string, payload: UpdateChapterPayload) => {
    await updateChapter(chapterId, payload);
    await loadCourseData();
  };

  const handleDeleteChapter = async (chapterId: string) => {
    await deleteChapter(chapterId);
    await loadCourseData();
  };

  const handleReorderChapters = async (payload: ReorderPayload) => {
    await reorderChapters(courseId, payload);
    await loadCourseData();
  };

  // Lesson Handlers
  const handleAddLesson = async (chapterId: string, payload: CreateLessonPayload) => {
    const newLesson = await createLesson(chapterId, payload);
    await loadCourseData();
    setSelectedLesson(newLesson);
    setIsLessonDrawerOpen(true);
  };

  const handleUpdateLesson = async (lessonId: string, payload: UpdateLessonPayload) => {
    await updateLesson(lessonId, payload);
    await loadCourseData();
  };

  const handleDeleteLesson = async (lessonId: string) => {
    await deleteLesson(lessonId);
    await loadCourseData();
  };

  const handleReorderLessons = async (chapterId: string, payload: ReorderPayload) => {
    await reorderLessons(chapterId, payload);
    await loadCourseData();
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsLessonDrawerOpen(true);
  };

  if (isLoading || !course) {
    return (
      <div className="min-h-screen bg-[#f6f5f4] pb-20">
        {/* Top App Header Skeleton */}
        <div className="sticky top-0 z-30 border-b border-neutral-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-6 w-48 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
          {/* Tab Switcher Skeleton */}
          <div className="flex gap-4 border-b border-neutral-200 pb-2">
            <Skeleton className="h-8 w-28 rounded-md" />
            <Skeleton className="h-8 w-36 rounded-md" />
          </div>

          {/* Curriculum Tree Skeletons */}
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2">
              <Skeleton className="h-6 w-40 rounded-md" />
              <Skeleton className="h-8 w-32 rounded-md" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded-md" />
                    <Skeleton className="h-5 w-48 rounded-md" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-20 rounded-md" />
                    <Skeleton className="h-7 w-7 rounded-md" />
                  </div>
                </div>
                <div className="pl-6 space-y-2 border-l-2 border-neutral-100 ml-2">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f5f4] pb-20">
      {/* Top App Header */}
      <CourseBuilderHeader
        course={course}
        isSaving={isSaving}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onArchive={handleArchive}
      />

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-neutral-200">
          <button
            type="button"
            onClick={() => setActiveTab("curriculum")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "curriculum"
                ? "border-[#0075de] text-[#0075de]"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Layers className="h-4 w-4" />
            Curriculum
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("metadata")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "metadata"
                ? "border-[#0075de] text-[#0075de]"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Settings className="h-4 w-4" />
            Settings & Metadata
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "curriculum" && (
          <CurriculumTree
            chapters={course.chapters || []}
            isPublished={course.status === "PUBLISHED"}
            onAddChapter={handleAddChapter}
            onUpdateChapter={handleUpdateChapter}
            onDeleteChapter={handleDeleteChapter}
            onReorderChapters={handleReorderChapters}
            onAddLesson={handleAddLesson}
            onUpdateLesson={handleUpdateLesson}
            onDeleteLesson={handleDeleteLesson}
            onReorderLessons={handleReorderLessons}
            onSelectLesson={handleSelectLesson}
          />
        )}

        {activeTab === "metadata" && (
          <CourseMetadataEditor
            course={course}
            categories={categories}
            onSave={handleUpdateCourseMetadata}
          />
        )}
      </div>

      {/* Lesson Drawer Slide-over */}
      <LessonDrawer
        lesson={selectedLesson}
        isOpen={isLessonDrawerOpen}
        onClose={() => setIsLessonDrawerOpen(false)}
        onUpdateLesson={handleUpdateLesson}
        onRefreshLesson={loadCourseData}
      />

      {/* Publish Checklist Modal */}
      <PublishChecklistModal
        isOpen={checklistOpen}
        onClose={() => setChecklistOpen(false)}
        onFixSection={(section) => {
          if (section === "metadata") setActiveTab("metadata");
          if (section === "curriculum") setActiveTab("curriculum");
        }}
        checklist={checklistState}
      />
    </div>
  );
}
