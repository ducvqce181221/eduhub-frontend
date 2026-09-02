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

  const getLevelBadge = (level: Course["level"]) => {
    switch (level) {
      case "BEGINNER":
        return <Badge variant="secondary" className="bg-sky-50 text-sky-700 border-sky-200">BEGINNER</Badge>;
      case "INTERMEDIATE":
        return <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">INTERMEDIATE</Badge>;
      case "ADVANCED":
        return <Badge variant="secondary" className="bg-rose-50 text-rose-700 border-rose-200">ADVANCED</Badge>;
    }
  };

  return (
    <>
      <div className="group flex flex-col rounded-xl border border-neutral-200 bg-white shadow-xs transition-all duration-200 hover:shadow-md">
        {/* Thumbnail header */}
        <div className="relative aspect-video w-full overflow-hidden rounded-t-xl bg-neutral-100">
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-400">
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
            <span className="text-xs font-medium text-neutral-500">
              {course.category?.name || "General"}
            </span>
            {getLevelBadge(course.level)}
          </div>

          <Link
            href={`/teacher/courses/${course.id}/builder`}
            className="line-clamp-2 text-base font-semibold text-neutral-900 transition-colors hover:text-[#0075de]"
          >
            {course.title}
          </Link>

          {course.description && (
            <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
              {course.description}
            </p>
          )}

          {/* Metrics Footer */}
          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {totalStudents} {totalStudents === 1 ? "student" : "students"}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
                </span>
              </div>

              {/* Actions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-neutral-900">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
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
                      className="cursor-pointer text-emerald-600 focus:text-emerald-700"
                    >
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Publish
                    </DropdownMenuItem>
                  )}

                  {course.status === "PUBLISHED" && (
                    <DropdownMenuItem
                      onClick={() => setShowUnpublishDialog(true)}
                      className="cursor-pointer text-amber-600 focus:text-amber-700"
                    >
                      <EyeOff className="mr-2 h-4 w-4" />
                      Unpublish to Draft
                    </DropdownMenuItem>
                  )}

                  {course.status !== "ARCHIVED" && (
                    <DropdownMenuItem
                      onClick={() => setShowArchiveDialog(true)}
                      className="cursor-pointer text-rose-600 focus:text-rose-700"
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
                className="flex-1 rounded-md border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <Link href={`/teacher/courses/${course.id}/builder`}>
                  Edit in Builder
                </Link>
              </Button>

              {course.status === "DRAFT" ? (
                <Button
                  size="sm"
                  onClick={() => setShowPublishDialog(true)}
                  className="rounded-md bg-[#0075de] px-3 text-xs font-medium text-white hover:bg-[#005bab] shrink-0"
                >
                  Publish
                </Button>
              ) : (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="rounded-md border-neutral-200 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-50 shrink-0"
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
