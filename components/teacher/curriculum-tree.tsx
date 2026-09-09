import React, { useState, useEffect } from "react";
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
  Loader2,
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
import { useSortable, isSortable } from "@dnd-kit/react/sortable";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/language-context";
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
  onSaveAllReorder?: (payload: {
    chapterOrders?: ReorderPayload;
    lessonOrders?: { chapterId: string; payload: ReorderPayload }[];
  }) => Promise<void>;
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
  index,
  isPublished,
  isSoleChapter,
  onUpdateChapter,
  onDeleteChapter,
  onAddLesson,
  onDeleteLesson,
  onSelectLesson,
  onLocalLessonReorder,
}: {
  chapter: Chapter;
  index: number;
  isPublished: boolean;
  isSoleChapter: boolean;
  onUpdateChapter: (chapterId: string, payload: UpdateChapterPayload) => Promise<void>;
  onDeleteChapter: (chapterId: string) => Promise<void>;
  onAddLesson: (chapterId: string, payload: CreateLessonPayload) => Promise<void>;
  onDeleteLesson: (lessonId: string) => Promise<void>;
  onSelectLesson: (lesson: Lesson) => void;
  onLocalLessonReorder: (chapterId: string, reorderedLessons: Lesson[]) => void;
}) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(chapter.title);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // useSortable: ref is attached to outer card container, handleRef is attached to the Grip handle button
  const { ref, handleRef } = useSortable({
    id: chapter.id,
    index,
    group: "chapters",
  });

  const handleSaveTitle = async () => {
    if (editTitle.trim() && editTitle.trim() !== chapter.title) {
      await onUpdateChapter(chapter.id, { title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleLessonDragEnd = (event: any) => {
    if (event.canceled) return;
    const { operation } = event;
    if (!operation) return;
    const { source, target } = operation;
    if (!source) return;

    const lessons = chapter.lessons || [];
    let fromIndex = -1;
    let toIndex = -1;

    if (typeof isSortable === "function" && isSortable(source)) {
      const currentIdx = lessons.findIndex((l) => l.id === source.id);
      if (currentIdx !== -1 && typeof source.index === "number") {
        fromIndex = currentIdx;
        toIndex = source.index;
      }
    }

    // Fallback for synthetic events or direct target drops
    if ((fromIndex === -1 || fromIndex === toIndex) && target && source.id !== target.id) {
      fromIndex = lessons.findIndex((l) => l.id === source.id);
      toIndex = lessons.findIndex((l) => l.id === target.id);
    }

    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
      const newLessons = Array.from(lessons);
      const [removed] = newLessons.splice(fromIndex, 1);
      newLessons.splice(toIndex, 0, removed);

      const reindexed = newLessons.map((l, idx) => ({
        ...l,
        order: idx + 1,
      }));
      onLocalLessonReorder(chapter.id, reindexed);
    }
  };

  // BR-CRS-08 / BR-CRS-09: Floor protection
  const isDeleteChapterBlocked = isPublished && isSoleChapter;

  return (
    <>
      <div
        ref={ref}
        data-testid={`chapter-item-${chapter.id}`}
        className="rounded-lg border border-hairline bg-surface shadow-notion-soft overflow-hidden"
      >
        {/* Chapter Header Bar */}
        <div className="flex items-center justify-between p-3.5 bg-canvas-soft/70 border-b border-hairline gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Grip handle button exclusively controls drag */}
            <button
              ref={handleRef}
              type="button"
              className="cursor-grab active:cursor-grabbing text-ink-faint hover:text-ink p-1 -ml-1 rounded transition-colors"
              title="Drag to reorder chapter"
              aria-label="Drag to reorder chapter"
              data-testid={`drag-chapter-${chapter.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-ink-muted hover:text-ink p-0.5 rounded transition-colors"
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {isEditingTitle ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") {
                    setEditTitle(chapter.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="h-7 text-xs font-semibold max-w-sm bg-surface border-hairline"
                autoFocus
              />
            ) : (
              <span
                onClick={() => setIsEditingTitle(true)}
                className="text-xs sm:text-sm font-semibold text-ink hover:text-notion-blue cursor-pointer truncate transition-colors"
                title="Click to rename chapter"
              >
                {chapter.title}
              </span>
            )}

            <span className="text-[11px] font-mono tabular-nums text-ink-muted">
              ({t.teacher.lessonsInChapter.replace("{count}", String(chapter.lessons?.length || 0))})
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                onAddLesson(chapter.id, {
                  title: t.teacher.defaultLessonTitle.replace(
                    "{number}",
                    String((chapter.lessons?.length || 0) + 1),
                  ),
                })
              }
              className="h-7 rounded-md px-2.5 text-xs font-medium text-notion-blue hover:bg-notion-blue/5 border border-notion-blue/20 hover:border-notion-blue/40 transition-colors cursor-pointer"
            >
              <Plus className="mr-1 h-3 w-3" />
              {t.teacher.addLesson}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsEditingTitle(true)}
              className="h-7 w-7 text-ink-muted hover:text-ink cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isDeleteChapterBlocked}
              title={isDeleteChapterBlocked ? t.teacher.floorProtectionTooltip : t.teacher.deleteChapter}
              data-testid={`delete-chapter-${chapter.id}`}
              onClick={() => setShowDeleteModal(true)}
              className={`h-7 w-7 ${
                isDeleteChapterBlocked
                  ? "cursor-not-allowed text-ink-faint opacity-40"
                  : "text-ink-muted hover:text-sticker-red hover:bg-canvas-soft cursor-pointer"
              }`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Chapter Lessons List isolated in its own DragDropProvider */}
        {isExpanded && (
          <DragDropProvider onDragEnd={handleLessonDragEnd}>
            <div className="divide-y divide-hairline bg-surface">
              {(!chapter.lessons || chapter.lessons.length === 0) ? (
                <div className="p-4 text-center text-xs text-ink-muted">
                  {t.teacher.noLessonsInChapter}
                </div>
              ) : (
                chapter.lessons.map((lesson, lessonIndex) => {
                  const isSoleLesson = chapter.lessons.length <= 1;
                  const isDeleteLessonBlocked = isPublished && isSoleLesson;

                  return (
                    <LessonRow
                      key={lesson.id}
                      chapterId={chapter.id}
                      lesson={lesson}
                      index={lessonIndex}
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
        title={t.teacher.deleteChapterTitle}
        confirmLabel={t.teacher.deleteChapter}
        description={
          t.teacher.deleteChapterDesc
            .replace("{title}", chapter.title)
            .replace("{count}", String(chapter.lessons?.length || 0))
        }
        onConfirm={async () => {
          await onDeleteChapter(chapter.id);
        }}
      />
    </>
  );
}

// Lesson Sortable Row
function LessonRow({
  chapterId,
  lesson,
  index,
  isDeleteBlocked,
  onDeleteLesson,
  onSelectLesson,
}: {
  chapterId: string;
  lesson: Lesson;
  index: number;
  isDeleteBlocked: boolean;
  onDeleteLesson: (lessonId: string) => Promise<void>;
  onSelectLesson: (lesson: Lesson) => void;
}) {
  const { t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // useSortable: ref is attached to row, handleRef is attached to Grip handle button
  const { ref, handleRef } = useSortable({
    id: lesson.id,
    index,
    group: `chapter-${chapterId}-lessons`,
  });

  const durationStr = formatDuration(lesson.video?.durationSeconds);

  return (
    <>
      <div
        ref={ref}
        data-testid={`lesson-row-${lesson.id}`}
        className="group flex items-center justify-between p-2.5 pl-4 sm:pl-6 pr-4 transition-colors hover:bg-canvas-soft/60 select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Grip handle button exclusively controls drag */}
          <button
            ref={handleRef}
            type="button"
            className="cursor-grab active:cursor-grabbing text-ink-faint hover:text-ink p-1 -ml-1 rounded transition-colors"
            title="Drag to reorder lesson"
            aria-label="Drag to reorder lesson"
            data-testid={`drag-lesson-${lesson.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>

          <span
            onClick={() => onSelectLesson(lesson)}
            className="truncate text-xs font-medium text-ink hover:text-notion-blue cursor-pointer transition-colors"
          >
            {lesson.title}
          </span>

          {/* Indicators */}
          <div className="flex items-center gap-1.5 shrink-0">
            {lesson.video ? (
              <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono tabular-nums bg-sticker-sky/15 text-sticker-sky-deep">
                <Video className="h-3 w-3" />
                {durationStr || t.teacher.videoIndicator}
              </span>
            ) : (
              <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-sticker-orange/15 text-sticker-orange-deep">
                {t.teacher.noVideoIndicator}
              </span>
            )}

            {lesson.quiz && (
              <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-sticker-purple/20 text-sticker-purple-deep">
                <HelpCircle className="h-3 w-3" />
                {t.course.quiz}
              </span>
            )}

            {lesson.resources && lesson.resources.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono tabular-nums bg-canvas-soft text-ink-muted border border-hairline">
                <FileText className="h-3 w-3" />
                {lesson.resources.length}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSelectLesson(lesson)}
            className="h-6 rounded-md px-2 text-[11px] font-medium text-ink-secondary hover:text-ink hover:bg-canvas-soft transition-colors cursor-pointer"
          >
            {t.teacher.editContent}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isDeleteBlocked}
            title={isDeleteBlocked ? t.teacher.floorProtectionTooltip : t.teacher.deleteLesson}
            data-testid={`delete-lesson-${lesson.id}`}
            onClick={() => setShowDeleteModal(true)}
            className={`h-6 w-6 ${
              isDeleteBlocked
                ? "cursor-not-allowed text-ink-faint opacity-40"
                : "text-ink-muted hover:text-sticker-red hover:bg-canvas-soft cursor-pointer"
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
        title={t.teacher.deleteLessonTitle}
        confirmLabel={t.teacher.deleteLesson}
        description={
          t.teacher.deleteLessonDesc.replace("{title}", lesson.title)
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
  onSaveAllReorder,
}: CurriculumTreeProps) {
  const { t } = useTranslation();
  const [localChapters, setLocalChapters] = useState<Chapter[]>(chapters);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingReorder, setIsSavingReorder] = useState(false);
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");

  // Sync with incoming server chapters if there are no unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) {
      setLocalChapters(chapters);
    }
  }, [chapters, hasUnsavedChanges]);

  const handleCreateChapter = async () => {
    if (!newChapterTitle.trim()) return;
    await onAddChapter({ title: newChapterTitle.trim() });
    setNewChapterTitle("");
    setIsAddingChapter(false);
  };

  const handleChapterDragEnd = (event: any) => {
    if (event.canceled) return;
    const { operation } = event;
    if (!operation) return;
    const { source, target } = operation;
    if (!source) return;

    let fromIndex = -1;
    let toIndex = -1;

    if (typeof isSortable === "function" && isSortable(source)) {
      const currentIdx = localChapters.findIndex((c) => c.id === source.id);
      if (currentIdx !== -1 && typeof source.index === "number") {
        fromIndex = currentIdx;
        toIndex = source.index;
      }
    }

    // Fallback for synthetic test events or direct target drops
    if ((fromIndex === -1 || fromIndex === toIndex) && target && source.id !== target.id) {
      fromIndex = localChapters.findIndex((c) => c.id === source.id);
      toIndex = localChapters.findIndex((c) => c.id === target.id);
    }

    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
      const updated = Array.from(localChapters);
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);

      const reindexed = updated.map((c, index) => ({
        ...c,
        order: index + 1,
      }));

      setLocalChapters(reindexed);
      setHasUnsavedChanges(true);
    }
  };

  const handleLocalLessonReorder = (chapterId: string, reorderedLessons: Lesson[]) => {
    setLocalChapters((prev) =>
      prev.map((ch) => (ch.id === chapterId ? { ...ch, lessons: reorderedLessons } : ch))
    );
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    setIsSavingReorder(true);
    try {
      if (onSaveAllReorder) {
        const chapterOrders = {
          orders: localChapters.map((c, i) => ({ id: c.id, order: i + 1 })),
        };
        const lessonOrders = localChapters.map((c) => ({
          chapterId: c.id,
          payload: {
            orders: (c.lessons || []).map((l, i) => ({ id: l.id, order: i + 1 })),
          },
        }));
        await onSaveAllReorder({ chapterOrders, lessonOrders });
      } else {
        // Fallback calling individual handlers
        const chapterOrders = {
          orders: localChapters.map((c, i) => ({ id: c.id, order: i + 1 })),
        };
        await onReorderChapters(chapterOrders);
        for (const c of localChapters) {
          if (c.lessons && c.lessons.length > 0) {
            await onReorderLessons(c.id, {
              orders: c.lessons.map((l, i) => ({ id: l.id, order: i + 1 })),
            });
          }
        }
      }
      setHasUnsavedChanges(false);
      toast.success(t.teacher.orderSavedSuccess);
    } catch (err: any) {
      toast.error(err?.message || t.teacher.orderSaveFailed);
    } finally {
      setIsSavingReorder(false);
    }
  };

  const handleDiscard = () => {
    setLocalChapters(chapters);
    setHasUnsavedChanges(false);
    toast.info(t.teacher.orderChangesDiscarded);
  };

  return (
    <div className="relative space-y-6 pb-12">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink">
            {t.teacher.curriculumTree}
          </h2>
          <p className="text-xs text-ink-muted">
            {t.teacher.curriculumSubtitle}
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setIsAddingChapter(true)}
          className="rounded-md bg-notion-blue text-xs font-medium text-white hover:bg-notion-blue-active shadow-2xs cursor-pointer"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          {t.teacher.addChapter}
        </Button>
      </div>

      {/* Chapters list wrapped in DragDropProvider */}
      <DragDropProvider onDragEnd={handleChapterDragEnd}>
        <div className="space-y-4">
          {localChapters.length === 0 ? (
            <div className="rounded-lg border border-dashed border-hairline bg-surface p-12 text-center shadow-notion-soft">
              <h3 className="text-sm font-semibold text-ink">
                {t.teacher.noChaptersYet}
              </h3>
              <p className="mt-1 text-xs text-ink-muted">
                {t.teacher.noChaptersYetDesc}
              </p>
              <Button
                type="button"
                onClick={() => setIsAddingChapter(true)}
                className="mt-4 rounded-md bg-notion-blue text-xs font-medium text-white hover:bg-notion-blue-active shadow-2xs cursor-pointer"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                {t.teacher.addChapter}
              </Button>
            </div>
          ) : (
            localChapters.map((ch, chapterIndex) => (
              <ChapterRow
                key={ch.id}
                chapter={ch}
                index={chapterIndex}
                isPublished={isPublished}
                isSoleChapter={localChapters.length <= 1}
                onUpdateChapter={onUpdateChapter}
                onDeleteChapter={onDeleteChapter}
                onAddLesson={onAddLesson}
                onDeleteLesson={onDeleteLesson}
                onSelectLesson={onSelectLesson}
                onLocalLessonReorder={handleLocalLessonReorder}
              />
            ))
          )}
        </div>
      </DragDropProvider>

      {/* Option 2: Floating Sticky Action Bar when there are unsaved reorder changes */}
      {hasUnsavedChanges && (
        <div
          data-testid="unsaved-reorder-bar"
          className="sticky bottom-6 z-40 mx-auto max-w-2xl rounded-lg border border-hairline bg-surface p-3.5 px-5 shadow-notion-elevated transition-all animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 rounded-full bg-sticker-orange animate-pulse" />
              <p className="text-xs font-semibold text-ink">
                {t.teacher.unsavedChangesNotice}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSavingReorder}
                onClick={handleDiscard}
                data-testid="discard-reorder-btn"
                className="h-8 rounded-md border-hairline text-xs font-medium text-ink-secondary hover:bg-canvas-soft cursor-pointer"
              >
                {t.teacher.discardChanges}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isSavingReorder}
                onClick={handleSaveChanges}
                data-testid="save-reorder-btn"
                className="h-8 rounded-md bg-notion-blue px-4 text-xs font-semibold text-white hover:bg-notion-blue-active shadow-2xs cursor-pointer"
              >
                {isSavingReorder ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    {t.common.saving}
                  </>
                ) : (
                  t.teacher.saveOrder
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Chapter Dialog */}
      <Dialog open={isAddingChapter} onOpenChange={setIsAddingChapter}>
        <DialogContent className="sm:max-w-md rounded-lg border border-hairline bg-surface p-6 shadow-notion-elevated">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-ink tracking-tight">
              {t.teacher.newChapterDialogTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <label className="block text-xs font-semibold text-ink">
              {t.teacher.chapterTitleLabel}
            </label>
            <Input
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              placeholder={t.teacher.chapterTitlePlaceholder.replace("{number}", String(localChapters.length + 1))}
              onKeyDown={(e) => e.key === "Enter" && handleCreateChapter()}
              className="mt-1.5 text-xs bg-surface border-hairline"
              autoFocus
            />
          </div>
          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddingChapter(false)}
              className="rounded-full border-hairline text-xs font-medium text-ink hover:bg-canvas-soft px-4 cursor-pointer"
            >
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              onClick={handleCreateChapter}
              disabled={!newChapterTitle.trim()}
              className="rounded-full bg-notion-blue hover:bg-notion-blue-hover text-white text-xs font-medium px-4 shadow-notion-soft cursor-pointer"
            >
              {t.teacher.createChapterButton}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

