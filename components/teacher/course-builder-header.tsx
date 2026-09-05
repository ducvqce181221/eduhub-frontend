import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  ArrowLeft,
  UploadCloud,
  EyeOff,
  Archive,
  BarChart2,
  Check,
  Loader2,
  Shield,
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

  const searchParams = useSearchParams();
  const { user } = useAuth();
  const isAdminContext =
    searchParams?.get("from") === "admin" || user?.role === "ADMIN";

  const getStatusBadge = (status: Course["status"]) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sticker-teal/15 px-2.5 py-0.5 text-xs font-semibold text-sticker-teal border border-sticker-teal/20">
            <span className="h-1.5 w-1.5 rounded-full bg-sticker-teal" />
            PUBLISHED
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas-soft px-2.5 py-0.5 text-xs font-semibold text-ink-muted border border-hairline">
            <Archive className="h-3 w-3 text-ink-muted" />
            ARCHIVED
          </span>
        );
      case "DRAFT":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sticker-amber/15 px-2.5 py-0.5 text-xs font-semibold text-sticker-amber-deep border border-sticker-amber/20">
            <span className="h-1.5 w-1.5 rounded-full bg-sticker-amber-deep" />
            DRAFT
          </span>
        );
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-hairline bg-surface px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Left section: Back + Title + Status */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-ink-muted hover:text-ink"
            >
              <Link
                href={isAdminContext ? "/admin/courses" : "/teacher/courses"}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">
                  {isAdminContext
                    ? "Back to Course Oversight"
                    : "Back to Courses"}
                </span>
              </Link>
            </Button>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-bold text-ink sm:text-lg">
                  {course.title}
                </h1>
                {getStatusBadge(course.status)}
              </div>
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                {isAdminContext && (
                  <>
                    <span className="inline-flex items-center gap-1 font-semibold text-sticker-orange-deep bg-sticker-orange/15 px-1.5 py-0.5 rounded text-[10px]">
                      <Shield className="w-3 h-3 text-sticker-orange" />
                      Admin Mode
                    </span>
                    <span>•</span>
                  </>
                )}
                <span>{course.category?.name}</span>
                <span>•</span>
                <span>{course.level}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin text-ink-muted" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Check className="h-3 w-3 text-sticker-teal" />
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
              className="hidden rounded-md border-hairline text-xs font-medium text-ink hover:bg-canvas-soft sm:inline-flex"
            >
              <Link href={`/teacher/courses/${course.id}/analytics`}>
                <BarChart2 className="mr-1.5 h-3.5 w-3.5" />
                Analytics
              </Link>
            </Button>

            {course.status === "DRAFT" && (
              <Button
                variant="pill"
                size="sm"
                onClick={() => setShowPublishDialog(true)}
                className="px-4 text-xs font-medium shadow-xs"
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
                className="rounded-md border-hairline text-xs font-medium text-sticker-orange-deep hover:bg-canvas-soft"
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
                className="rounded-md text-xs font-medium text-ink-muted hover:text-sticker-red hover:bg-canvas-soft"
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
