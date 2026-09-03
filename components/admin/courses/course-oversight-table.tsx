"use client";

import React from "react";
import Link from "next/link";
import { Search, BookOpen, ExternalLink, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/common/pagination";
import type { Course, PaginationMeta, Category } from "@/types/api";

interface CourseOversightTableProps {
  courses: Course[];
  meta?: PaginationMeta;
  categories?: Category[];
  searchQuery?: string;
  selectedCategory?: string;
  onSearchChange: (query: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onPageChange: (page: number) => void;
  onArchiveCourse: (course: Course) => void;
  isLoading?: boolean;
}

export function CourseOversightTable({
  courses,
  meta,
  categories = [],
  searchQuery = "",
  selectedCategory = "ALL",
  onSearchChange,
  onCategoryChange,
  onPageChange,
  onArchiveCourse,
  isLoading = false,
}: CourseOversightTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            PUBLISHED
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            DRAFT
          </span>
        );
      case "ARCHIVED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-600 ring-1 ring-inset ring-neutral-300">
            <Archive className="h-3 w-3 text-neutral-400" />
            ARCHIVED
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search courses by title..."
            className="pl-9 bg-white rounded-lg border-neutral-200 text-xs focus-visible:ring-[#0075de]"
          />
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-9 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-700 shadow-2xs focus:border-[#0075de] focus:outline-none"
            aria-label="Filter by category"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Courses Oversight Table */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-[#f6f5f4] text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Instructor</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-xs text-neutral-400"
                  >
                    Loading platform courses...
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-xs text-neutral-400"
                  >
                    No courses found matching criteria.
                  </td>
                </tr>
              ) : (
                courses.map((course) => {
                  const isArchived = course.status === "ARCHIVED";

                  return (
                    <tr
                      key={course.id}
                      className="transition-colors hover:bg-neutral-50/70"
                    >
                      {/* Course Title */}
                      <td className="py-3.5 px-4 font-semibold text-neutral-900">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sky-50 text-[#0075de]">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div className="max-w-xs truncate">
                            <p className="truncate">{course.title}</p>
                            <p className="font-mono text-[10px] text-neutral-400 truncate">
                              {course.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Teacher */}
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-neutral-900">
                          {course.teacher?.fullName || "Unassigned"}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          {course.teacher?.email}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-neutral-600">
                        {course.category?.name || "N/A"}
                      </td>

                      {/* Level */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className="rounded-full border-neutral-200 bg-neutral-50 text-[10px] font-medium text-neutral-600"
                        >
                          {course.level}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(course.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/courses/${course.slug || course.id}?from=admin`}
                            className="inline-flex h-7 items-center rounded-md border border-neutral-200 bg-white px-2 text-[11px] font-medium text-neutral-700 shadow-2xs hover:bg-neutral-100"
                          >
                            <ExternalLink className="mr-1 h-3 w-3 text-neutral-500" />
                            View
                          </Link>

                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isArchived}
                            data-testid={`archive-course-${course.id}`}
                            onClick={() => onArchiveCourse(course)}
                            className={`h-7 rounded-md px-2 text-[11px] font-medium ${
                              isArchived
                                ? "cursor-not-allowed opacity-50 text-neutral-400"
                                : "text-amber-700 hover:bg-amber-50 hover:border-amber-200"
                            }`}
                          >
                            <Archive className="mr-1 h-3 w-3" />
                            Archive
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="border-t border-neutral-100 bg-neutral-50/50 p-4">
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
