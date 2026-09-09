"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Archive, AlertTriangle } from "lucide-react";
import type { Course } from "@/types/api";

interface ArchiveCourseDialogProps {
  open: boolean;
  course: Course | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => Promise<void> | void;
}

export function ArchiveCourseDialog({
  open,
  course,
  onOpenChange,
  onConfirm,
}: ArchiveCourseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!course) return null;

  const handleArchive = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await onConfirm(course.id);
      onOpenChange(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to archive course");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-lg bg-surface border border-hairline p-6 shadow-notion-dropdown">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-sticker-amber/20 bg-sticker-amber/15 text-sticker-amber-deep dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300">
              <Archive className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-ink">
                Archive Course
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs text-ink-muted pt-1">
            Retire{" "}
            <strong className="text-ink font-medium">
              {course.title}
            </strong>{" "}
            from public discovery and new enrollments.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="rounded-md bg-rose-500/10 p-3 text-xs font-medium text-rose-600 dark:text-rose-400 border border-rose-500/20">
            {errorMessage}
          </div>
        )}

        <div className="rounded-md border border-sticker-amber/20 bg-sticker-amber/10 p-3.5 text-xs text-sticker-amber-deep dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 space-y-1">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0 text-sticker-amber-deep dark:text-amber-300" />
            <span>Terminal State Policy (BR-CRS-04)</span>
          </div>
          <p className="text-[11px] leading-relaxed opacity-90">
            Archiving a course is a permanent terminal state in MVP. Once archived, the course is hidden from catalog discovery and accepts no new enrollments. Existing enrolled learners will retain read-only access.
          </p>
        </div>

        <DialogFooter className="pt-3 gap-2 sm:gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full text-xs font-medium border-hairline text-ink hover:bg-canvas-soft px-4"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleArchive}
            className="rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium px-4 shadow-notion-soft"
          >
            {isSubmitting ? "Archiving..." : "Confirm Archive"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
