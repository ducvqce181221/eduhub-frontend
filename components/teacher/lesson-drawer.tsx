import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/i18n/language-context";
import { VideoUploader } from "./video-uploader";
import { ResourcesManager } from "./resources-manager";
import { QuizEditor } from "./quiz-editor";
import {
  upsertLessonVideo,
  attachVideoFromLibrary,
  createLessonResource,
  attachResourceFromLibrary,
  deleteLessonResource,
  createLessonQuiz,
  updateLessonQuiz,
  deleteLessonQuiz,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
} from "@/lib/api/curriculum";
import { apiClient } from "@/lib/api/client";
import type {
  Lesson,
  UpdateLessonPayload,
  UpsertVideoPayload,
  CreateResourcePayload,
  CreateQuizPayload,
  UpdateQuizPayload,
  CreateQuestionPayload,
  QuizDetail,
} from "@/types/api";

interface LessonDrawerProps {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLesson: (lessonId: string, payload: UpdateLessonPayload) => Promise<void>;
  onRefreshLesson: () => Promise<void>;
}

export function LessonDrawer({
  lesson,
  isOpen,
  onClose,
  onUpdateLesson,
  onRefreshLesson,
}: LessonDrawerProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"general" | "video" | "resources" | "quiz">("general");
  const [title, setTitle] = useState(lesson?.title || "");
  const [description, setDescription] = useState(lesson?.description || "");
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [quizDetail, setQuizDetail] = useState<QuizDetail | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title);
      setDescription(lesson.description || "");
      fetchLessonQuiz(lesson.id);
    }
  }, [lesson]);

  const fetchLessonQuiz = async (lessonId: string) => {
    try {
      setIsLoadingQuiz(true);
      // Fetch full lesson content to get quiz with questions
      const res = await apiClient.get<any>(`/lessons/${lessonId}`);
      if (res.data?.quiz) {
        setQuizDetail(res.data.quiz);
      } else {
        setQuizDetail(null);
      }
    } catch {
      setQuizDetail(null);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  if (!lesson) return null;

  const handleSaveGeneral = async () => {
    try {
      setIsSavingGeneral(true);
      await onUpdateLesson(lesson.id, {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      await onRefreshLesson();
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleSaveVideo = async (data: UpsertVideoPayload) => {
    await upsertLessonVideo(lesson.id, data);
    await onRefreshLesson();
  };

  const handleAttachVideo = async (assetId: string, customTitle?: string) => {
    await attachVideoFromLibrary(lesson.id, { assetId, customTitle });
    await onRefreshLesson();
  };

  const handleAddResource = async (payload: CreateResourcePayload) => {
    await createLessonResource(lesson.id, payload);
    await onRefreshLesson();
  };

  const handleAttachResource = async (assetId: string, customName?: string) => {
    await attachResourceFromLibrary(lesson.id, { assetId, customName });
    await onRefreshLesson();
  };

  const handleDeleteResource = async (resourceId: string) => {
    await deleteLessonResource(resourceId);
    await onRefreshLesson();
  };

  const handleCreateQuiz = async (payload: CreateQuizPayload) => {
    const created = await createLessonQuiz(lesson.id, payload);
    setQuizDetail({ ...created, lessonId: lesson.id, questions: [] });
    await onRefreshLesson();
  };

  const handleUpdateQuiz = async (payload: UpdateQuizPayload) => {
    if (!quizDetail) return;
    const updated = await updateLessonQuiz(quizDetail.id, payload);
    setQuizDetail((prev) => (prev ? { ...prev, ...updated } : null));
    await onRefreshLesson();
  };

  const handleDeleteQuiz = async () => {
    if (!quizDetail) return;
    await deleteLessonQuiz(quizDetail.id);
    setQuizDetail(null);
    await onRefreshLesson();
  };

  const handleAddQuestion = async (payload: CreateQuestionPayload) => {
    if (!quizDetail) return;
    const question = await createQuizQuestion(quizDetail.id, payload);
    setQuizDetail((prev) =>
      prev ? { ...prev, questions: [...(prev.questions || []), question] } : null
    );
    await onRefreshLesson();
  };

  const handleUpdateQuestion = async (questionId: string, payload: any) => {
    if (!quizDetail) return;
    const updated = await updateQuizQuestion(questionId, payload);
    setQuizDetail((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((q) => (q.id === questionId ? updated : q)),
          }
        : null
    );
    await onRefreshLesson();
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!quizDetail) return;
    await deleteQuizQuestion(questionId);
    setQuizDetail((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.filter((q) => q.id !== questionId),
          }
        : null
    );
    await onRefreshLesson();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto p-0 border-l border-hairline bg-surface shadow-notion-elevated">
        <div className="sticky top-0 z-10 border-b border-hairline bg-surface p-6 pr-14 pb-4">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-ink tracking-tight">
              {t.teacher.editLesson}
            </SheetTitle>
            <SheetDescription className="text-xs text-ink-muted">
              {t.teacher.editLessonSubtitle}
            </SheetDescription>
          </SheetHeader>

          {/* Navigation Tabs */}
          <div className="mt-4 flex gap-2 border-b border-hairline pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer ${
                activeTab === "general"
                  ? "bg-notion-blue text-white shadow-2xs"
                  : "bg-canvas-soft text-ink-secondary hover:bg-canvas-soft/80 border border-hairline"
              }`}
            >
              {t.teacher.tabGeneral}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("video")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer ${
                activeTab === "video"
                  ? "bg-notion-blue text-white shadow-2xs"
                  : "bg-canvas-soft text-ink-secondary hover:bg-canvas-soft/80 border border-hairline"
              }`}
            >
              {t.teacher.tabVideo} {lesson.video ? "✓" : ""}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("resources")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer ${
                activeTab === "resources"
                  ? "bg-notion-blue text-white shadow-2xs"
                  : "bg-canvas-soft text-ink-secondary hover:bg-canvas-soft/80 border border-hairline"
              }`}
            >
              {t.teacher.tabResources} ({lesson.resources?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quiz")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer ${
                activeTab === "quiz"
                  ? "bg-notion-blue text-white shadow-2xs"
                  : "bg-canvas-soft text-ink-secondary hover:bg-canvas-soft/80 border border-hairline"
              }`}
            >
              {t.course.quiz} {lesson.quiz ? "✓" : ""}
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {activeTab === "general" && (
            <div className="space-y-4 rounded-lg border border-hairline bg-canvas-soft/40 p-5 shadow-notion-soft">
              <div>
                <label className="block text-xs font-semibold text-ink">
                  {t.teacher.lessonTitleLabel}
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.teacher.lessonTitlePlaceholder}
                  className="mt-1 text-sm bg-surface border-hairline text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink">
                  {t.teacher.lessonDescriptionLabel}
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.teacher.lessonDescriptionPlaceholder}
                  rows={4}
                  className="mt-1 text-xs resize-none bg-surface border-hairline text-ink"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSaveGeneral}
                  disabled={isSavingGeneral || !title.trim()}
                  className="rounded-full bg-notion-blue text-xs font-semibold text-white hover:bg-notion-blue-hover shadow-notion-soft px-4 cursor-pointer"
                >
                  {isSavingGeneral ? t.common.saving : t.teacher.saveLessonDetails}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "video" && (
            <VideoUploader
              currentVideo={lesson.video}
              onSaveVideo={handleSaveVideo}
              onAttachFromLibrary={handleAttachVideo}
            />
          )}

          {activeTab === "resources" && (
            <ResourcesManager
              resources={lesson.resources || []}
              onAddResource={handleAddResource}
              onDeleteResource={handleDeleteResource}
              onAttachFromLibrary={handleAttachResource}
            />
          )}

          {activeTab === "quiz" && (
            <QuizEditor
              quiz={quizDetail}
              onCreateQuiz={handleCreateQuiz}
              onUpdateQuiz={handleUpdateQuiz}
              onDeleteQuiz={handleDeleteQuiz}
              onAddQuestion={handleAddQuestion}
              onUpdateQuestion={handleUpdateQuestion}
              onDeleteQuestion={handleDeleteQuestion}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
