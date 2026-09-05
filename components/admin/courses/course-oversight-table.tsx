"use client";

import React from "react";
import Link from "next/link";
import { Search, BookOpen, ExternalLink, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Pagination } from "@/components/common/pagination";
import type { Course, PaginationMeta, Category } from "@/types/api";

interface CourseOversightTableProps {
  courses: Course[];
  meta?: PaginationMeta;
  categories?: Category[];
  searchQuery?: string;
  selectedCategory?: string;
  selectedStatus?: string;
  onSearchChange: (query: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onStatusChange?: (status: string) => void;
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
  selectedStatus = "ALL",
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onPageChange,
  onArchiveCourse,
  isLoading = false,
}: CourseOversightTableProps) {
  const getLevelBadge = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return (
          <Badge variant="teal" className="text-[10px] px-2 py-0.5 font-medium">
            BEGINNER
          </Badge>
        );
      case "INTERMEDIATE":
        return (
          <Badge variant="sky" className="text-[10px] px-2 py-0.5 font-medium">
            INTERMEDIATE
          </Badge>
        );
      case "ADVANCED":
        return (
          <Badge variant="purple" className="text-[10px] px-2 py-0.5 font-medium">
            ADVANCED
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-medium bg-canvas-soft border-hairline">
            {level}
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sticker-teal/15 px-2.5 py-0.5 text-[11px] font-medium text-sticker-teal border border-sticker-teal/20">
            <span className="h-1.5 w-1.5 rounded-full bg-sticker-teal" />
            PUBLISHED
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sticker-amber/15 px-2.5 py-0.5 text-[11px] font-medium text-sticker-amber-deep border border-sticker-amber/20">
            <span className="h-1.5 w-1.5 rounded-full bg-sticker-amber-deep" />
            DRAFT
          </span>
        );
      case "ARCHIVED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas-soft px-2.5 py-0.5 text-[11px] font-medium text-ink-muted border border-hairline">
            <Archive className="h-3 w-3 text-ink-muted" />
            ARCHIVED
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={searchQuery}
            onSearch={onSearchChange}
            placeholder="Search courses by title..."
            size="sm"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange?.(e.target.value)}
            className="h-9 rounded-md border border-hairline bg-surface px-3 py-1.5 text-xs text-ink shadow-2xs focus:border-notion-blue focus:outline-none"
            aria-label="Filter by course status"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Category filter */}
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="h-9 rounded-md border border-hairline bg-surface px-3 py-1.5 text-xs text-ink shadow-2xs focus:border-notion-blue focus:outline-none"
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
      </div>

      {/* Courses Oversight Table */}
      <div className="overflow-hidden rounded-lg border border-hairline bg-surface shadow-notion-soft">
        <Table className="border-0 rounded-none">
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-xs text-ink-muted"
                >
                  Loading platform courses...
                </TableCell>
              </TableRow>
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-xs text-ink-muted"
                >
                  No courses found matching criteria.
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => {
                const isArchived = course.status === "ARCHIVED";

                return (
                  <TableRow
                    key={course.id}
                    className="transition-colors hover:bg-canvas-soft/50"
                  >
                    {/* Course Title */}
                    <TableCell className="font-medium text-ink">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-canvas-soft border border-hairline text-ink-muted">
                          <BookOpen className="h-3.5 w-3.5" />
                        </div>
                        <div className="max-w-xs truncate">
                          <p className="truncate text-xs font-medium text-ink">{course.title}</p>
                          <p className="font-mono text-[10px] text-ink-muted truncate">
                            {course.slug}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Teacher */}
                    <TableCell>
                      <p className="font-medium text-xs text-ink">
                        {course.teacher?.fullName || "Unassigned"}
                      </p>
                      <p className="text-[11px] text-ink-muted">
                        {course.teacher?.email}
                      </p>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="text-xs text-ink-secondary">
                      {course.category?.name || "N/A"}
                    </TableCell>

                    {/* Level */}
                    <TableCell>
                      {getLevelBadge(course.level)}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {getStatusBadge(course.status)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/courses/${course.slug || course.id}?from=admin`}
                          className="inline-flex h-7 items-center rounded-md border border-hairline bg-surface px-2 text-[11px] font-medium text-ink shadow-2xs hover:bg-canvas-soft"
                        >
                          <ExternalLink className="mr-1 h-3 w-3 text-ink-muted" />
                          View
                        </Link>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isArchived}
                          data-testid={`archive-course-${course.id}`}
                          onClick={() => onArchiveCourse(course)}
                          className={`h-7 rounded-md px-2 text-[11px] font-medium border-hairline ${
                            isArchived
                              ? "cursor-not-allowed opacity-50 text-ink-muted"
                              : "text-amber-700 hover:bg-amber-500/10 hover:border-amber-300"
                          }`}
                        >
                          <Archive className="mr-1 h-3 w-3" />
                          Archive
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="border-t border-hairline bg-canvas-soft/40 p-3">
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
