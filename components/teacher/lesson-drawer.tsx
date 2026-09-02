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
import { VideoUploader } from "./video-uploader";
import { ResourcesManager } from "./resources-manager";
import { QuizEditor } from "./quiz-editor";
import {
  upsertLessonVideo,
  createLessonResource,
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

  const handleAddResource = async (payload: CreateResourcePayload) => {
    await createLessonResource(lesson.id, payload);
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
    const newQuestion = await createQuizQuestion(quizDetail.id, payload);
    setQuizDetail((prev) =>
      prev ? { ...prev, questions: [...(prev.questions || []), newQuestion] } : null
    );
    await onRefreshLesson();
  };

  const handleUpdateQuestion = async (questionId: string, payload: any) => {
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
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto p-0 border-l border-neutral-200 shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white p-6 pb-4">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-neutral-900">
              Edit Lesson
            </SheetTitle>
            <SheetDescription className="text-xs text-neutral-500">
              Configure lesson content, Cloudflare R2 video, attachments, and quiz.
            </SheetDescription>
          </SheetHeader>

          {/* Navigation Tabs */}
          <div className="mt-4 flex gap-2 border-b border-neutral-100 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                activeTab === "general"
                  ? "bg-[#0075de] text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              General Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("video")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                activeTab === "video"
                  ? "bg-[#0075de] text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              Video {lesson.video ? "✓" : ""}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("resources")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                activeTab === "resources"
                  ? "bg-[#0075de] text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              Resources ({lesson.resources?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quiz")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                activeTab === "quiz"
                  ? "bg-[#0075de] text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              Quiz {lesson.quiz ? "✓" : ""}
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {activeTab === "general" && (
            <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700">
                  Lesson Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 1.1 Architecture Overview"
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">
                  Lesson Description / Notes
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide overview notes, timestamps, or instructions..."
                  rows={4}
                  className="mt-1 text-xs resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSaveGeneral}
                  disabled={isSavingGeneral || !title.trim()}
                  className="rounded-md bg-[#0075de] text-xs font-medium text-white hover:bg-[#005bab]"
                >
                  {isSavingGeneral ? "Saving..." : "Save Details"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "video" && (
            <VideoUploader
              currentVideo={lesson.video}
              onSaveVideo={handleSaveVideo}
            />
          )}

          {activeTab === "resources" && (
            <ResourcesManager
              resources={lesson.resources || []}
              onAddResource={handleAddResource}
              onDeleteResource={handleDeleteResource}
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
