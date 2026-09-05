"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, CheckCircle2, FileEdit, Archive } from "lucide-react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/admin-header";
import { CourseOversightTable } from "@/components/admin/courses/course-oversight-table";
import { ArchiveCourseDialog } from "@/components/admin/courses/archive-course-dialog";
import { getAllCourses, getCourseStats, archiveCourse, getCategories } from "@/lib/api/admin";
import type { Course } from "@/types/api";

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();

  // Search & Filter state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Dialog state
  const [archivingCourse, setArchivingCourse] = useState<Course | null>(null);

  // Platform Overall Stats Query
  const { data: stats } = useQuery({
    queryKey: ["admin-courses-stats"],
    queryFn: () => getCourseStats(),
  });

  // Fetch courses
  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["admin-courses", page, limit, search, categoryFilter, statusFilter],
    queryFn: () =>
      getAllCourses({
        page,
        limit,
        search: search.trim() || undefined,
        categoryId: categoryFilter === "ALL" ? undefined : categoryFilter,
        status: statusFilter,
      }),
  });

  // Fetch categories for filtering
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories-active"],
    queryFn: () => getCategories(false),
  });

  const courses = coursesData?.items || [];
  const meta = coursesData?.meta;

  // Mutations
  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveCourse(id),
    onSuccess: () => {
      toast.success("Course has been archived successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-courses-stats"] });
      setArchivingCourse(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to archive course");
    },
  });

  // Metrics from platform overall stats
  const totalCourses = stats?.total ?? meta?.total ?? courses.length;
  const publishedCount = stats?.published ?? courses.filter((c) => c.status === "PUBLISHED").length;
  const draftCount = stats?.draft ?? courses.filter((c) => c.status === "DRAFT").length;
  const archivedCount = stats?.archived ?? courses.filter((c) => c.status === "ARCHIVED").length;

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader
        title="Course Oversight"
        breadcrumb="Administration / Courses"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            Platform Courses
          </h2>
          <p className="text-xs text-ink-muted">
            Audit published curricula, inspect author assignments, and manage life-cycle states.
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-hairline bg-surface p-4 shadow-notion-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-canvas-soft border border-hairline text-ink-muted">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  Total Courses
                </p>
                <h3 className="text-xl font-semibold tracking-tight text-ink font-mono tabular-nums">
                  {totalCourses}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-hairline bg-surface p-4 shadow-notion-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sticker-teal/15 border border-sticker-teal/20 text-sticker-teal">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  Published
                </p>
                <h3 className="text-xl font-semibold tracking-tight text-ink font-mono tabular-nums">
                  {publishedCount}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-hairline bg-surface p-4 shadow-notion-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sticker-amber/15 border border-sticker-amber/20 text-sticker-amber-deep">
                <FileEdit className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  Drafts
                </p>
                <h3 className="text-xl font-semibold tracking-tight text-ink font-mono tabular-nums">
                  {draftCount}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-hairline bg-surface p-4 shadow-notion-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-canvas-soft border border-hairline text-ink-muted">
                <Archive className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  Archived
                </p>
                <h3 className="text-xl font-semibold tracking-tight text-ink font-mono tabular-nums">
                  {archivedCount}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <CourseOversightTable
          courses={courses}
          meta={meta}
          categories={categories}
          searchQuery={search}
          selectedCategory={categoryFilter}
          selectedStatus={statusFilter}
          onSearchChange={(q) => {
            setSearch(q);
            setPage(1);
          }}
          onCategoryChange={(c) => {
            setCategoryFilter(c);
            setPage(1);
          }}
          onStatusChange={(s) => {
            setStatusFilter(s);
            setPage(1);
          }}
          onPageChange={setPage}
          onArchiveCourse={(c) => setArchivingCourse(c)}
          isLoading={isLoadingCourses}
        />
      </div>

      {/* Archive Confirmation Dialog */}
      <ArchiveCourseDialog
        open={!!archivingCourse}
        course={archivingCourse}
        onOpenChange={(open) => !open && setArchivingCourse(null)}
        onConfirm={async (id) => {
          await archiveMutation.mutateAsync(id);
        }}
      />
    </div>
  );
}
