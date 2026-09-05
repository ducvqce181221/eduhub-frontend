import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MoreVertical,
  BookOpen,
  Users,
  Edit3,
  BarChart2,
  UploadCloud,
  EyeOff,
  Archive,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Course } from "@/types/api";

interface TeacherCourseCardProps {
  course: Course;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onArchive: (id: string) => void;
}

export function TeacherCourseCard({
  course,
  onPublish,
  onUnpublish,
  onArchive,
}: TeacherCourseCardProps) {
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  // Count total lessons
  const totalLessons =
    course.chapters?.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0) || 0;
  const totalStudents = course._count?.enrollments || 0;

  const getStatusBadge = (status: Course["status"]) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center rounded-full bg-sticker-teal/15 px-2.5 py-0.5 text-xs font-semibold text-sticker-teal border border-transparent">
            PUBLISHED
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="inline-flex items-center rounded-full bg-canvas-soft px-2.5 py-0.5 text-xs font-semibold text-ink-muted border border-hairline">
            ARCHIVED
          </span>
        );
      case "DRAFT":
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-sticker-orange/15 px-2.5 py-0.5 text-xs font-semibold text-sticker-orange-deep border border-transparent">
            DRAFT
          </span>
        );
    }
  };

  const getLevelBadge = (level: Course["level"]) => {
    switch (level) {
      case "BEGINNER":
        return <Badge variant="secondary" className="bg-sticker-sky/15 text-sticker-sky-deep border-transparent">BEGINNER</Badge>;
      case "INTERMEDIATE":
        return <Badge variant="secondary" className="bg-sticker-purple/15 text-sticker-purple border-transparent">INTERMEDIATE</Badge>;
      case "ADVANCED":
        return <Badge variant="secondary" className="bg-sticker-orange/15 text-sticker-orange-deep border-transparent">ADVANCED</Badge>;
    }
  };

  return (
    <>
      <div className="group flex flex-col rounded-lg border border-hairline bg-surface shadow-notion-soft transition-all duration-200 hover:border-ink/20">
        {/* Thumbnail header */}
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-canvas-soft border-b border-hairline">
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-canvas-soft text-ink-muted">
              <Layers className="h-10 w-10 stroke-1" />
            </div>
          )}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            {getStatusBadge(course.status)}
          </div>
        </div>

        {/* Card Body */}
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-ink-muted">
              {course.category?.name || "General"}
            </span>
            {getLevelBadge(course.level)}
          </div>

          <Link
            href={`/teacher/courses/${course.id}/builder`}
            className="line-clamp-2 text-base font-semibold text-ink transition-colors hover:text-notion-blue"
          >
            {course.title}
          </Link>

          {course.description && (
            <p className="mt-1 line-clamp-2 text-xs text-ink-muted leading-relaxed">
              {course.description}
            </p>
          )}

          {/* Metrics Footer */}
          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between border-t border-hairline pt-3 text-xs text-ink-muted">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 tabular-nums font-mono">
                  <Users className="h-3.5 w-3.5 text-ink-faint" />
                  {totalStudents} {totalStudents === 1 ? "student" : "students"}
                </span>
                <span className="flex items-center gap-1 tabular-nums font-mono">
                  <BookOpen className="h-3.5 w-3.5 text-ink-faint" />
                  {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
                </span>
              </div>

              {/* Actions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-ink-muted hover:text-ink">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 shadow-notion-dropdown">
                  <DropdownMenuItem asChild>
                    <Link href={`/teacher/courses/${course.id}/builder`} className="cursor-pointer">
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit Course
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/teacher/courses/${course.id}/analytics`} className="cursor-pointer">
                      <BarChart2 className="mr-2 h-4 w-4" />
                      View Analytics
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />

                  {course.status === "DRAFT" && (
                    <DropdownMenuItem
                      onClick={() => setShowPublishDialog(true)}
                      className="cursor-pointer text-sticker-teal focus:text-sticker-teal"
                    >
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Publish
                    </DropdownMenuItem>
                  )}

                  {course.status === "PUBLISHED" && (
                    <DropdownMenuItem
                      onClick={() => setShowUnpublishDialog(true)}
                      className="cursor-pointer text-sticker-orange-deep focus:text-sticker-orange-deep"
                    >
                      <EyeOff className="mr-2 h-4 w-4" />
                      Unpublish to Draft
                    </DropdownMenuItem>
                  )}

                  {course.status !== "ARCHIVED" && (
                    <DropdownMenuItem
                      onClick={() => setShowArchiveDialog(true)}
                      className="cursor-pointer text-sticker-red focus:text-sticker-red"
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archive Course
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Quick action button */}
            <div className="mt-3 flex gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="flex-1 rounded-md border-hairline text-xs font-medium text-ink hover:bg-canvas-soft"
              >
                <Link href={`/teacher/courses/${course.id}/builder`}>
                  Edit in Builder
                </Link>
              </Button>

              {course.status === "DRAFT" ? (
                <Button
                  size="sm"
                  onClick={() => setShowPublishDialog(true)}
                  className="rounded-md bg-notion-blue px-3 text-xs font-medium text-white hover:bg-notion-blue-active shrink-0 shadow-2xs"
                >
                  Publish
                </Button>
              ) : (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="rounded-md border-hairline px-3 text-xs font-medium text-ink hover:bg-canvas-soft shrink-0"
                >
                  <Link href={`/teacher/courses/${course.id}/analytics`}>
                    Analytics
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Publish Confirmation Dialog */}
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
        onConfirm={() => onPublish(course.id)}
      />

      {/* Unpublish Confirmation Dialog */}
      <ConfirmDialog
        open={showUnpublishDialog}
        onOpenChange={setShowUnpublishDialog}
        variant="warning"
        title="Unpublish Course?"
        confirmLabel="Confirm Unpublish"
        description={
          <>
            Unpublishing will return this course to <strong>DRAFT</strong> status, hiding it from public catalog. Enrolled students will still retain access.
          </>
        }
        onConfirm={() => onUnpublish(course.id)}
      />

      {/* Archive Confirmation Dialog (BR-CRS-04: Terminal state) */}
      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        variant="danger"
        title="Archive Course?"
        confirmLabel="Confirm Archive"
        description={
          <>
            Archiving is a <strong>permanent action (terminal state)</strong>. The course will be hidden from public discovery and will accept no new enrollments. Existing enrolled students will still retain access.
          </>
        }
        onConfirm={() => onArchive(course.id)}
      />
    </>
  );
}
