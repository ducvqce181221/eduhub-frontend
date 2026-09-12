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
import { useTranslation } from "@/lib/i18n/language-context";
import { translateCourseLevel, translateCourseStatus } from "@/lib/i18n/formatters";
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
  const { t, language } = useTranslation();

  const getLevelBadge = (level: string) => {
    const localizedLevel = language === "vi" ? translateCourseLevel(level as any, t) : level;
    switch (level) {
      case "BEGINNER":
        return (
          <Badge variant="teal" className="text-[10px] px-2 py-0.5 font-medium">
            {localizedLevel}
          </Badge>
        );
      case "INTERMEDIATE":
        return (
          <Badge variant="sky" className="text-[10px] px-2 py-0.5 font-medium">
            {localizedLevel}
          </Badge>
        );
      case "ADVANCED":
        return (
          <Badge variant="purple" className="text-[10px] px-2 py-0.5 font-medium">
            {localizedLevel}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-medium bg-canvas-soft border-hairline">
            {localizedLevel}
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    const localizedStatus = language === "vi" ? translateCourseStatus(status as any, t) : status;
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sticker-teal/15 px-2.5 py-0.5 text-[11px] font-medium text-sticker-teal border border-sticker-teal/20 dark:text-teal-300 dark:border-teal-500/30 dark:bg-teal-500/15">
            <span className="h-1.5 w-1.5 rounded-full bg-sticker-teal dark:bg-teal-400" />
            {localizedStatus}
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sticker-amber/15 px-2.5 py-0.5 text-[11px] font-medium text-sticker-amber-deep border border-sticker-amber/20 dark:text-amber-300 dark:border-amber-500/30 dark:bg-amber-500/15">
            <span className="h-1.5 w-1.5 rounded-full bg-sticker-amber-deep dark:bg-amber-400" />
            {localizedStatus}
          </span>
        );
      case "ARCHIVED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas-soft px-2.5 py-0.5 text-[11px] font-medium text-ink-muted border border-hairline">
            <Archive className="h-3 w-3 text-ink-muted" />
            {localizedStatus}
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
            placeholder={t.admin.searchCoursesPlaceholder}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange?.(e.target.value)}
            className="h-9 rounded-md border border-hairline bg-surface px-3 py-1.5 text-xs text-ink shadow-2xs focus:border-notion-blue focus:outline-none [&>option]:bg-surface [&>option]:text-ink"
            aria-label="Filter by course status"
          >
            <option value="ALL">{t.admin.filterAllStatuses}</option>
            <option value="PUBLISHED">{language === "vi" ? "Đã xuất bản" : "Published"}</option>
            <option value="DRAFT">{language === "vi" ? "Bản nháp" : "Draft"}</option>
            <option value="ARCHIVED">{language === "vi" ? "Đã lưu trữ" : "Archived"}</option>
          </select>

          {/* Category filter */}
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="h-9 rounded-md border border-hairline bg-surface px-3 py-1.5 text-xs text-ink shadow-2xs focus:border-notion-blue focus:outline-none [&>option]:bg-surface [&>option]:text-ink"
              aria-label="Filter by category"
            >
              <option value="ALL">{t.admin.filterAllCategories}</option>
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
              <TableHead>{t.admin.columnCourse}</TableHead>
              <TableHead>{t.admin.columnInstructor}</TableHead>
              <TableHead>{t.admin.columnCategory}</TableHead>
              <TableHead>{t.admin.columnLevel}</TableHead>
              <TableHead>{t.admin.columnStatus}</TableHead>
              <TableHead className="text-right">{t.admin.columnActions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-xs text-ink-muted"
                >
                  {t.admin.loadingCourses}
                </TableCell>
              </TableRow>
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-xs text-ink-muted"
                >
                  {t.admin.noCoursesFound}
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
                          {language === "vi" ? "Xem" : "View"}
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
                          {language === "vi" ? "Lưu trữ" : "Archive"}
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
