"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useTranslation } from "@/lib/i18n/language-context";
import { LocalizedLink } from "@/components/common/localized-link";
import { translateCourseLevel, translateCourseStatus } from "@/lib/i18n/formatters";
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
  const { t } = useTranslation();
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const searchParams = useSearchParams();
  const { user } = useAuth();
  const isAdminContext =
    searchParams?.get("from") === "admin" || user?.role === "ADMIN";

  const getStatusBadge = (status: Course["status"]) => {
    const localizedStatus = translateCourseStatus(status, t);
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sticker-teal/15 px-2.5 py-0.5 text-xs font-semibold text-sticker-teal border border-sticker-teal/20 dark:text-teal-300 dark:border-teal-500/30 dark:bg-teal-500/15">
            <span className="h-1.5 w-1.5 rounded-full bg-sticker-teal dark:bg-teal-400" />
            {localizedStatus}
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas-soft px-2.5 py-0.5 text-xs font-semibold text-ink-muted border border-hairline">
            <Archive className="h-3 w-3 text-ink-muted" />
            {localizedStatus}
          </span>
        );
      case "DRAFT":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sticker-amber/15 px-2.5 py-0.5 text-xs font-semibold text-sticker-amber-deep border border-sticker-amber/20 dark:text-amber-300 dark:border-amber-500/30 dark:bg-amber-500/15">
            <span className="h-1.5 w-1.5 rounded-full bg-sticker-amber-deep dark:bg-amber-400" />
            {localizedStatus}
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
              className="h-8 w-8 text-ink-muted hover:text-ink cursor-pointer"
            >
              <LocalizedLink
                href={isAdminContext ? "/admin/courses" : "/teacher/courses"}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">
                  {isAdminContext
                    ? t.admin.sidebarCourses
                    : t.teacher.dashboardTitle}
                </span>
              </LocalizedLink>
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
                    <span className="inline-flex items-center gap-1 font-semibold text-sticker-orange-deep bg-sticker-orange/15 dark:text-orange-300 dark:bg-orange-500/15 px-1.5 py-0.5 rounded text-[10px]">
                      <Shield className="w-3 h-3 text-sticker-orange dark:text-orange-300" />
                      {t.teacher.adminModeBadge}
                    </span>
                    <span>•</span>
                  </>
                )}
                <span>{course.category?.name}</span>
                <span>•</span>
                <span>{translateCourseLevel(course.level, t)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin text-ink-muted" />
                      {t.common.saving}
                    </>
                  ) : (
                    <>
                      <Check className="h-3 w-3 text-sticker-teal dark:text-teal-300" />
                      {t.common.saved}
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
              className="hidden rounded-md border-hairline text-xs font-medium text-ink hover:bg-canvas-soft sm:inline-flex cursor-pointer"
            >
              <LocalizedLink href={`/teacher/courses/${course.id}/analytics`}>
                <BarChart2 className="mr-1.5 h-3.5 w-3.5" />
                {t.teacher.analytics}
              </LocalizedLink>
            </Button>

            {course.status === "DRAFT" && (
              <Button
                variant="pill"
                size="sm"
                onClick={() => setShowPublishDialog(true)}
                className="px-4 text-xs font-medium shadow-xs cursor-pointer"
              >
                <UploadCloud className="mr-1.5 h-3.5 w-3.5" />
                {t.teacher.publishCourse}
              </Button>
            )}

            {course.status === "PUBLISHED" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowUnpublishDialog(true)}
                className="rounded-md border-hairline text-xs font-medium text-sticker-orange-deep hover:bg-canvas-soft cursor-pointer"
              >
                <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                {t.teacher.unpublishCourse}
              </Button>
            )}

            {course.status !== "ARCHIVED" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowArchiveDialog(true)}
                className="rounded-md text-xs font-medium text-ink-muted hover:text-sticker-red hover:bg-canvas-soft cursor-pointer"
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
        title={t.teacher.publishDialogTitle}
        confirmLabel={t.teacher.publishDialogConfirm}
        description={t.teacher.publishDialogDesc.replace("{title}", course.title)}
        onConfirm={onPublish}
      />

      {/* Unpublish Confirm Dialog */}
      <ConfirmDialog
        open={showUnpublishDialog}
        onOpenChange={setShowUnpublishDialog}
        variant="warning"
        title={t.teacher.unpublishDialogTitle}
        confirmLabel={t.teacher.unpublishDialogConfirm}
        description={t.teacher.unpublishDialogDesc}
        onConfirm={onUnpublish}
      />

      {/* Archive Confirm Dialog (BR-CRS-04: Terminal state) */}
      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        variant="danger"
        title={t.teacher.archiveDialogTitle}
        confirmLabel={t.teacher.archiveDialogConfirm}
        description={t.teacher.archiveDialogDesc}
        onConfirm={onArchive}
      />
    </>
  );
}
