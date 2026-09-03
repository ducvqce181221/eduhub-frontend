import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CourseOversightTable } from "@/components/admin/courses/course-oversight-table";
import { ArchiveCourseDialog } from "@/components/admin/courses/archive-course-dialog";
import type { Course, PaginationMeta } from "@/types/api";

const mockCourses: Course[] = [
  {
    id: "course-1",
    title: "Mastering React 19",
    slug: "mastering-react-19-k12345",
    description: "Deep dive into React 19 actions, hooks, and compiler.",
    level: "INTERMEDIATE",
    status: "PUBLISHED",
    categoryId: "cat-1",
    category: { id: "cat-1", name: "Frontend", slug: "frontend", isActive: true },
    teacherId: "teacher-1",
    teacher: { id: "teacher-1", fullName: "John Doe", email: "teacher@eduhub.dev" },
    createdAt: "2026-08-15T10:00:00.000Z",
  },
  {
    id: "course-2",
    title: "Deprecated Legacy System",
    slug: "deprecated-legacy-system-x99999",
    description: "Old course that needs retirement.",
    level: "BEGINNER",
    status: "ARCHIVED",
    categoryId: "cat-2",
    category: { id: "cat-2", name: "DevOps", slug: "devops", isActive: true },
    teacherId: "teacher-2",
    teacher: { id: "teacher-2", fullName: "Jane Smith", email: "jane@eduhub.dev" },
    createdAt: "2026-07-10T10:00:00.000Z",
  },
];

const mockMeta: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 2,
  totalPages: 1,
};

describe("Course Oversight Components (Admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("CourseOversightTable", () => {
    it("renders course list with instructor details, category, status badges, and action buttons", () => {
      render(
        <CourseOversightTable
          courses={mockCourses}
          meta={mockMeta}
          onSearchChange={vi.fn()}
          onCategoryChange={vi.fn()}
          onPageChange={vi.fn()}
          onArchiveCourse={vi.fn()}
        />,
      );

      expect(screen.getByText("Mastering React 19")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Frontend")).toBeInTheDocument();
      expect(screen.getByText("PUBLISHED")).toBeInTheDocument();

      expect(screen.getByText("Deprecated Legacy System")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("ARCHIVED")).toBeInTheDocument();

      const viewLinks = screen.getAllByRole("link", { name: /view/i });
      expect(viewLinks[0]).toHaveAttribute(
        "href",
        "/courses/mastering-react-19-k12345?from=admin",
      );
    });

    it("disables archive button if course is already archived (BR-CRS-04)", () => {
      render(
        <CourseOversightTable
          courses={mockCourses}
          meta={mockMeta}
          onSearchChange={vi.fn()}
          onCategoryChange={vi.fn()}
          onPageChange={vi.fn()}
          onArchiveCourse={vi.fn()}
        />,
      );

      const activeCourseArchiveBtn = screen.getByTestId("archive-course-course-1");
      expect(activeCourseArchiveBtn).not.toBeDisabled();

      const alreadyArchivedBtn = screen.getByTestId("archive-course-course-2");
      expect(alreadyArchivedBtn).toBeDisabled();
    });
  });

  describe("ArchiveCourseDialog", () => {
    it("displays terminal state warning and triggers archive action on confirmation", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      render(
        <ArchiveCourseDialog
          open={true}
          course={mockCourses[0]}
          onOpenChange={vi.fn()}
          onConfirm={onConfirm}
        />,
      );

      expect(screen.getByRole("heading", { name: /archive course/i })).toBeInTheDocument();
      expect(screen.getByText(/Terminal State Policy/i)).toBeInTheDocument();
      expect(screen.getByText("Mastering React 19")).toBeInTheDocument();

      const confirmBtn = screen.getByRole("button", { name: /confirm archive/i });
      await user.click(confirmBtn);

      expect(onConfirm).toHaveBeenCalledWith("course-1");
    });
  });
});
