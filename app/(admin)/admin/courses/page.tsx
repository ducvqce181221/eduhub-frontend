"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, CheckCircle2, FileEdit, Archive } from "lucide-react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/admin-header";
import { CourseOversightTable } from "@/components/admin/courses/course-oversight-table";
import { ArchiveCourseDialog } from "@/components/admin/courses/archive-course-dialog";
import { getAllCourses, archiveCourse, getCategories } from "@/lib/api/admin";
import type { Course } from "@/types/api";

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();

  // Search & Filter state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Dialog state
  const [archivingCourse, setArchivingCourse] = useState<Course | null>(null);

  // Fetch courses
  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["admin-courses", page, limit, search, categoryFilter],
    queryFn: () =>
      getAllCourses({
        page,
        limit,
        search: search.trim() || undefined,
        categoryId: categoryFilter === "ALL" ? undefined : categoryFilter,
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
      setArchivingCourse(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to archive course");
    },
  });

  // Metrics
  const totalCourses = meta?.total || courses.length;
  const publishedCount = courses.filter((c) => c.status === "PUBLISHED").length;
  const draftCount = courses.filter((c) => c.status === "DRAFT").length;
  const archivedCount = courses.filter((c) => c.status === "ARCHIVED").length;

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader
        title="Course Oversight"
        breadcrumb="Administration / Courses"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Platform Courses
          </h2>
          <p className="text-xs text-neutral-500">
            Audit published curricula, inspect author assignments, and manage life-cycle states.
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-[#0075de]">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Total Courses
                </p>
                <h3 className="text-xl font-bold text-neutral-900">
                  {totalCourses}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Published
                </p>
                <h3 className="text-xl font-bold text-neutral-900">
                  {publishedCount}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <FileEdit className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Drafts
                </p>
                <h3 className="text-xl font-bold text-neutral-900">
                  {draftCount}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                <Archive className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Archived
                </p>
                <h3 className="text-xl font-bold text-neutral-900">
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
          onSearchChange={(q) => {
            setSearch(q);
            setPage(1);
          }}
          onCategoryChange={(c) => {
            setCategoryFilter(c);
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
