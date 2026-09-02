import React, { useState } from "react";
import {
  GripVertical,
  Plus,
  Trash2,
  Edit3,
  Video,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import type {
  Chapter,
  Lesson,
  CreateChapterPayload,
  UpdateChapterPayload,
  CreateLessonPayload,
  UpdateLessonPayload,
  ReorderPayload,
} from "@/types/api";

interface CurriculumTreeProps {
  chapters: Chapter[];
  isPublished: boolean;
  onAddChapter: (payload: CreateChapterPayload) => Promise<void>;
  onUpdateChapter: (chapterId: string, payload: UpdateChapterPayload) => Promise<void>;
  onDeleteChapter: (chapterId: string) => Promise<void>;
  onReorderChapters: (payload: ReorderPayload) => Promise<void>;
  onAddLesson: (chapterId: string, payload: CreateLessonPayload) => Promise<void>;
  onUpdateLesson: (lessonId: string, payload: UpdateLessonPayload) => Promise<void>;
  onDeleteLesson: (lessonId: string) => Promise<void>;
  onReorderLessons: (chapterId: string, payload: ReorderPayload) => Promise<void>;
  onSelectLesson: (lesson: Lesson) => void;
}

const FLOOR_PROTECTION_TOOLTIP =
  "Cannot delete the last lesson/chapter of a published course. Please unpublish first.";

function formatDuration(seconds?: number) {
  if (!seconds || seconds <= 0) return null;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

// Chapter Sortable Item
function ChapterRow({
  chapter,
  isPublished,
  isSoleChapter,
  onUpdateChapter,
  onDeleteChapter,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  onReorderLessons,
  onSelectLesson,
}: {
  chapter: Chapter;
  isPublished: boolean;
  isSoleChapter: boolean;
  onUpdateChapter: (chapterId: string, payload: UpdateChapterPayload) => Promise<void>;
  onDeleteChapter: (chapterId: string) => Promise<void>;
  onAddLesson: (chapterId: string, payload: CreateLessonPayload) => Promise<void>;
  onUpdateLesson: (lessonId: string, payload: UpdateLessonPayload) => Promise<void>;
  onDeleteLesson: (lessonId: string) => Promise<void>;
  onReorderLessons: (chapterId: string, payload: ReorderPayload) => Promise<void>;
  onSelectLesson: (lesson: Lesson) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(chapter.title);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // useSortable without restricting handleRef allows dragging from anywhere on the header!
  const { ref } = useSortable({
    id: chapter.id,
    index: chapter.order || 0,
  });

  const handleSaveTitle = async () => {
    if (editTitle.trim() && editTitle.trim() !== chapter.title) {
      await onUpdateChapter(chapter.id, { title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleLessonDragEnd = async (event: any) => {
    const { operation } = event;
    if (!operation) return;
    const { source, target } = operation;
    if (!source || !target || source.id === target.id) return;

    const lessons = chapter.lessons || [];
    const sourceIndex = lessons.findIndex((l) => l.id === source.id);
    const targetIndex = lessons.findIndex((l) => l.id === target.id);

    if (sourceIndex !== -1 && targetIndex !== -1) {
      const newLessons = Array.from(lessons);
      const [removed] = newLessons.splice(sourceIndex, 1);
      newLessons.splice(targetIndex, 0, removed);

      const orders = newLessons.map((l, index) => ({
        id: l.id,
        order: index + 1,
      }));
      await onReorderLessons(chapter.id, { orders });
    }
  };

  const isDeleteChapterBlocked = isPublished && isSoleChapter;

  return (
    <>
      <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs transition-all overflow-hidden">
        {/* Chapter Header Bar - Entire header is draggable */}
        <div
          ref={ref}
          className="flex cursor-grab active:cursor-grabbing items-center justify-between border-b border-neutral-100 bg-neutral-50/70 p-3 sm:px-4 select-none hover:bg-neutral-100/60 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="text-neutral-400">
              <GripVertical className="h-4 w-4" />
            </span>

            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-neutral-500 hover:text-neutral-900 cursor-pointer p-0.5 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {isEditingTitle ? (
              <div
                className="flex items-center gap-2 flex-1 max-w-sm"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                  autoFocus
                  className="h-7 text-xs font-semibold bg-white"
                />
              </div>
            ) : (
              <span
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingTitle(true);
                }}
                className="cursor-pointer truncate text-sm font-semibold text-neutral-900 hover:text-[#0075de]"
                title="Click to rename chapter"
              >
                {chapter.title}
              </span>
            )}

            <span className="text-[11px] font-medium text-neutral-400">
              ({chapter.lessons?.length || 0} lessons)
            </span>
          </div>

          <div
            className="flex items-center gap-1 shrink-0"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onAddLesson(chapter.id, { title: `Lesson ${(chapter.lessons?.length || 0) + 1}` })}
              className="h-7 rounded-md px-2 text-xs font-medium text-[#0075de] hover:bg-sky-50"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Lesson
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsEditingTitle(true)}
              className="h-7 w-7 text-neutral-400 hover:text-neutral-700"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isDeleteChapterBlocked}
              title={isDeleteChapterBlocked ? FLOOR_PROTECTION_TOOLTIP : "Delete chapter"}
              data-testid={`delete-chapter-${chapter.id}`}
              onClick={() => setShowDeleteModal(true)}
              className={`h-7 w-7 ${
                isDeleteChapterBlocked
                  ? "cursor-not-allowed text-neutral-300 opacity-50"
                  : "text-neutral-400 hover:text-rose-600"
              }`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Chapter Lessons List isolated in its own DragDropProvider */}
        {isExpanded && (
          <DragDropProvider onDragEnd={handleLessonDragEnd}>
            <div className="divide-y divide-neutral-100 bg-white">
              {(!chapter.lessons || chapter.lessons.length === 0) ? (
                <div className="p-4 text-center text-xs text-neutral-400">
                  No lessons in this chapter. Click &quot;Add Lesson&quot; to create one.
                </div>
              ) : (
                chapter.lessons.map((lesson) => {
                  const isSoleLesson = chapter.lessons.length <= 1;
                  const isDeleteLessonBlocked = isPublished && isSoleLesson;

                  return (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      isDeleteBlocked={isDeleteLessonBlocked}
                      onDeleteLesson={onDeleteLesson}
                      onSelectLesson={onSelectLesson}
                    />
                  );
                })
              )}
            </div>
          </DragDropProvider>
        )}
      </div>

      {/* Delete Chapter Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        variant="danger"
        title="Delete Chapter?"
        confirmLabel="Delete Chapter"
        description={
          <>
            Are you sure you want to delete <strong>&quot;{chapter.title}&quot;</strong>? All {chapter.lessons?.length || 0} lessons inside this chapter will be permanently removed.
          </>
        }
        onConfirm={async () => {
          await onDeleteChapter(chapter.id);
        }}
      />
    </>
  );
}

// Lesson Sortable Row - entire row is draggable
function LessonRow({
  lesson,
  isDeleteBlocked,
  onDeleteLesson,
  onSelectLesson,
}: {
  lesson: Lesson;
  isDeleteBlocked: boolean;
  onDeleteLesson: (lessonId: string) => Promise<void>;
  onSelectLesson: (lesson: Lesson) => void;
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { ref } = useSortable({
    id: lesson.id,
    index: lesson.order || 0,
  });

  const durationStr = formatDuration(lesson.video?.durationSeconds);

  return (
    <>
      <div
        ref={ref}
        onClick={() => onSelectLesson(lesson)}
        className="group flex cursor-grab active:cursor-grabbing items-center justify-between p-2.5 pl-6 pr-4 transition-colors hover:bg-neutral-50/90 select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="text-neutral-300 group-hover:text-neutral-500">
            <GripVertical className="h-3.5 w-3.5" />
          </span>

          <span className="truncate text-xs font-medium text-neutral-800 group-hover:text-[#0075de]">
            {lesson.title}
          </span>

          {/* Indicators */}
          <div className="flex items-center gap-1.5 shrink-0">
            {lesson.video ? (
              <span className="inline-flex items-center gap-1 rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-[#0075de]">
                <Video className="h-3 w-3" />
                {durationStr || "Video"}
              </span>
            ) : (
              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                No Video
              </span>
            )}

            {lesson.quiz && (
              <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">
                <HelpCircle className="h-3 w-3" />
                Quiz
              </span>
            )}

            {lesson.resources && lesson.resources.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                <FileText className="h-3 w-3" />
                {lesson.resources.length}
              </span>
            )}
          </div>
        </div>

        <div
          className="flex items-center gap-1 shrink-0"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSelectLesson(lesson)}
            className="h-6 rounded px-2 text-[11px] font-medium text-neutral-500 hover:text-neutral-900"
          >
            Edit Content
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isDeleteBlocked}
            title={isDeleteBlocked ? FLOOR_PROTECTION_TOOLTIP : "Delete lesson"}
            data-testid={`delete-lesson-${lesson.id}`}
            onClick={() => setShowDeleteModal(true)}
            className={`h-6 w-6 ${
              isDeleteBlocked
                ? "cursor-not-allowed text-neutral-300 opacity-50"
                : "text-neutral-400 hover:text-rose-600"
            }`}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Delete Lesson Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        variant="danger"
        title="Delete Lesson?"
        confirmLabel="Delete Lesson"
        description={
          <>
            Are you sure you want to delete <strong>&quot;{lesson.title}&quot;</strong>? Any attached video, resources, and quiz data will be permanently deleted.
          </>
        }
        onConfirm={async () => {
          await onDeleteLesson(lesson.id);
        }}
      />
    </>
  );
}

export function CurriculumTree({
  chapters,
  isPublished,
  onAddChapter,
  onUpdateChapter,
  onDeleteChapter,
  onReorderChapters,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  onReorderLessons,
  onSelectLesson,
}: CurriculumTreeProps) {
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");

  const handleCreateChapter = async () => {
    if (!newChapterTitle.trim()) return;
    await onAddChapter({ title: newChapterTitle.trim() });
    setNewChapterTitle("");
    setIsAddingChapter(false);
  };

  const handleChapterDragEnd = async (event: any) => {
    const { operation } = event;
    if (!operation) return;
    const { source, target } = operation;
    if (!source || !target || source.id === target.id) return;

    const sourceChapterIndex = chapters.findIndex((c) => c.id === source.id);
    const targetChapterIndex = chapters.findIndex((c) => c.id === target.id);

    if (sourceChapterIndex !== -1 && targetChapterIndex !== -1) {
      const newChapters = Array.from(chapters);
      const [removed] = newChapters.splice(sourceChapterIndex, 1);
      newChapters.splice(targetChapterIndex, 0, removed);

      const orders = newChapters.map((c, index) => ({
        id: c.id,
        order: index + 1,
      }));
      await onReorderChapters({ orders });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">
            Curriculum Structure
          </h2>
          <p className="text-xs text-neutral-500">
            Organize chapters and lessons. Click and drag anywhere on cards to reorder sections.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setIsAddingChapter(true)}
          className="rounded-md bg-[#0075de] text-xs font-medium text-white hover:bg-[#005bab]"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Chapter
        </Button>
      </div>

      {/* Chapters list wrapped in DragDropProvider */}
      <DragDropProvider onDragEnd={handleChapterDragEnd}>
        <div className="space-y-4">
          {chapters.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-200 bg-white p-12 text-center">
              <h3 className="text-sm font-semibold text-neutral-900">
                No chapters added yet
              </h3>
              <p className="mt-1 text-xs text-neutral-500">
                Create your first chapter to begin building your course curriculum.
              </p>
              <Button
                type="button"
                onClick={() => setIsAddingChapter(true)}
                className="mt-4 rounded-md bg-[#0075de] text-xs text-white hover:bg-[#005bab]"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Chapter
              </Button>
            </div>
          ) : (
            chapters.map((ch) => (
              <ChapterRow
                key={ch.id}
                chapter={ch}
                isPublished={isPublished}
                isSoleChapter={chapters.length <= 1}
                onUpdateChapter={onUpdateChapter}
                onDeleteChapter={onDeleteChapter}
                onAddLesson={onAddLesson}
                onUpdateLesson={onUpdateLesson}
                onDeleteLesson={onDeleteLesson}
                onReorderLessons={onReorderLessons}
                onSelectLesson={onSelectLesson}
              />
            ))
          )}
        </div>
      </DragDropProvider>

      {/* Add Chapter Dialog */}
      <Dialog open={isAddingChapter} onOpenChange={setIsAddingChapter}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-neutral-900">
              New Chapter
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <label className="block text-xs font-semibold text-neutral-700">
              Chapter Title
            </label>
            <Input
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              placeholder={`Chapter ${chapters.length + 1}: Introduction`}
              onKeyDown={(e) => e.key === "Enter" && handleCreateChapter()}
              className="mt-1.5 text-xs bg-white border-neutral-200"
              autoFocus
            />
          </div>
          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddingChapter(false)}
              className="rounded-xl border-neutral-200 text-xs font-semibold text-neutral-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateChapter}
              disabled={!newChapterTitle.trim()}
              className="rounded-xl bg-[#0075de] text-xs font-semibold text-white hover:bg-[#005bab] shadow-xs"
            >
              Create Chapter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
