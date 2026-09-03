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
      <DialogContent className="sm:max-w-md rounded-xl bg-white p-6 shadow-xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Archive className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-neutral-900">
                Archive Course
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs text-neutral-500 pt-1">
            Retire{" "}
            <strong className="text-neutral-900 font-semibold">
              {course.title}
            </strong>{" "}
            from public discovery and new enrollments.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
            {errorMessage}
          </div>
        )}

        <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-800 space-y-1">
          <div className="flex items-center gap-2 font-semibold text-amber-900">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>Terminal State Policy (BR-CRS-04)</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-700">
            Archiving a course is a permanent terminal state in MVP. Once archived, the course is hidden from catalog discovery and accepts no new enrollments. Existing enrolled learners will retain read-only access.
          </p>
        </div>

        <DialogFooter className="pt-3 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs font-medium border-neutral-200"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleArchive}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium"
          >
            {isSubmitting ? "Archiving..." : "Confirm Archive"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
