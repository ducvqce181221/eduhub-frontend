import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  UploadCloud,
  EyeOff,
  Archive,
  BarChart2,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Course } from "@/types/api";

interface CourseBuilderHeaderProps {
  course: Course;
  isSaving: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
  onArchive: () => void;
}

export function CourseBuilderHeader({
  course,
  isSaving,
  onPublish,
  onUnpublish,
  onArchive,
}: CourseBuilderHeaderProps) {
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const getStatusBadge = (status: Course["status"]) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            PUBLISHED
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600 ring-1 ring-inset ring-neutral-500/20">
            ARCHIVED
          </span>
        );
      case "DRAFT":
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
            DRAFT
          </span>
        );
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Left section: Back + Title + Status */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-neutral-500 hover:text-neutral-900"
            >
              <Link href="/teacher/courses">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Courses</span>
              </Link>
            </Button>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-bold text-neutral-900 sm:text-lg">
                  {course.title}
                </h1>
                {getStatusBadge(course.status)}
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span>{course.category?.name}</span>
                <span>•</span>
                <span>{course.level}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin text-neutral-500" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      Saved
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Right section: Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden rounded-md border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-50 sm:inline-flex"
            >
              <Link href={`/teacher/courses/${course.id}/analytics`}>
                <BarChart2 className="mr-1.5 h-3.5 w-3.5" />
                Analytics
              </Link>
            </Button>

            {course.status === "DRAFT" && (
              <Button
                size="sm"
                onClick={() => setShowPublishDialog(true)}
                className="rounded-full bg-[#0075de] px-4 text-xs font-medium text-white hover:bg-[#005bab] shadow-xs active:scale-95"
              >
                <UploadCloud className="mr-1.5 h-3.5 w-3.5" />
                Publish Course
              </Button>
            )}

            {course.status === "PUBLISHED" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowUnpublishDialog(true)}
                className="rounded-md border-neutral-200 text-xs font-medium text-amber-700 hover:bg-amber-50"
              >
                <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                Unpublish
              </Button>
            )}

            {course.status !== "ARCHIVED" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowArchiveDialog(true)}
                className="rounded-md text-xs font-medium text-neutral-500 hover:text-rose-600"
              >
                <Archive className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Publish Confirm Dialog */}
      <ConfirmDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        variant="primary"
        title="Publish Course?"
        confirmLabel="Confirm Publish"
        description={
          <>
            Publishing will make <strong>&quot;{course.title}&quot;</strong> publicly visible in the course catalog for all students to discover and enroll.
          </>
        }
        onConfirm={onPublish}
      />

      {/* Unpublish Confirm Dialog */}
      <ConfirmDialog
        open={showUnpublishDialog}
        onOpenChange={setShowUnpublishDialog}
        variant="warning"
        title="Unpublish Course?"
        confirmLabel="Confirm Unpublish"
        description={
          <>
            Unpublishing will return this course to <strong>DRAFT</strong> status, hiding it from catalog discovery. Existing enrolled students will continue to have access.
          </>
        }
        onConfirm={onUnpublish}
      />

      {/* Archive Confirm Dialog (BR-CRS-04: Terminal state) */}
      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        variant="danger"
        title="Archive Course?"
        confirmLabel="Confirm Archive"
        description={
          <>
            Archiving is a <strong>permanent terminal state (BR-CRS-04)</strong>. It cannot be reverted. Enrolled students will still retain access to study, but new enrollments will be permanently closed.
          </>
        }
        onConfirm={onArchive}
      />
    </>
  );
}
