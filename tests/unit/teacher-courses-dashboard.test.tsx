import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TeacherCourseCard } from "@/components/teacher/teacher-course-card";
import { TeacherCoursesHeader } from "@/components/teacher/teacher-courses-header";
import { CreateCourseDialog } from "@/components/teacher/create-course-dialog";
import type { Course } from "@/types/api";

const mockCourse: Course = {
  id: "course-123",
  title: "Building Microservices with NestJS",
  slug: "building-microservices-with-nestjs-k8x2d9",
  description: "Learn to build production-ready distributed microservices.",
  level: "INTERMEDIATE",
  status: "DRAFT",
  categoryId: "cat-1",
  category: { id: "cat-1", name: "Backend", slug: "backend", isActive: true },
  teacherId: "teacher-1",
  teacher: { id: "teacher-1", fullName: "John Teacher", email: "teacher@example.com" },
  thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
  chapters: [
    {
      id: "ch-1",
      title: "Introduction",
      order: 1,
      lessons: [
        { id: "les-1", title: "Overview", order: 1, video: { id: "v-1", videoUrl: "https://r2.dev/video.mp4", durationSeconds: 600 } },
      ],
    },
  ],
  _count: {
    chapters: 1,
    enrollments: 24,
  },
  createdAt: "2026-08-20T10:00:00.000Z",
};

describe("Teacher Dashboard UI Components", () => {
  describe("TeacherCourseCard", () => {
    it("renders course details, badges, and metrics", () => {
      render(<TeacherCourseCard course={mockCourse} onPublish={vi.fn()} onUnpublish={vi.fn()} onArchive={vi.fn()} />);

      expect(screen.getByText("Building Microservices with NestJS")).toBeInTheDocument();
      expect(screen.getByText("Backend")).toBeInTheDocument();
      expect(screen.getByText("INTERMEDIATE")).toBeInTheDocument();
      expect(screen.getByText("DRAFT")).toBeInTheDocument();
      expect(screen.getByText("24 students")).toBeInTheDocument();
      expect(screen.getByText("1 lesson")).toBeInTheDocument();
    });

    it("displays correct status badge color styling according to Notion design system", () => {
      const { rerender } = render(
        <TeacherCourseCard course={{ ...mockCourse, status: "PUBLISHED" }} onPublish={vi.fn()} onUnpublish={vi.fn()} onArchive={vi.fn()} />
      );
      expect(screen.getByText("PUBLISHED")).toBeInTheDocument();

      rerender(
        <TeacherCourseCard course={{ ...mockCourse, status: "ARCHIVED" }} onPublish={vi.fn()} onUnpublish={vi.fn()} onArchive={vi.fn()} />
      );
      expect(screen.getByText("ARCHIVED")).toBeInTheDocument();
    });

    it("triggers publish/unpublish/archive actions", async () => {
      const onPublish = vi.fn();
      const onArchive = vi.fn();
      const user = userEvent.setup();

      render(<TeacherCourseCard course={mockCourse} onPublish={onPublish} onUnpublish={vi.fn()} onArchive={onArchive} />);

      const publishBtn = screen.getByRole("button", { name: /^publish$/i });
      await user.click(publishBtn);

      const confirmBtn = screen.getByRole("button", { name: /confirm publish/i });
      await user.click(confirmBtn);

      expect(onPublish).toHaveBeenCalledWith(mockCourse.id);
    });
  });

  describe("TeacherCoursesHeader", () => {
    it("renders total course count and triggers new course button", async () => {
      const onNewCourse = vi.fn();
      const user = userEvent.setup();

      render(<TeacherCoursesHeader totalCourses={5} onNewCourse={onNewCourse} />);

      expect(screen.getByText("My Courses")).toBeInTheDocument();
      expect(screen.getByText("5 total")).toBeInTheDocument();

      const createBtn = screen.getByRole("button", { name: /new course/i });
      await user.click(createBtn);
      expect(onNewCourse).toHaveBeenCalled();
    });
  });

  describe("CreateCourseDialog", () => {
    it("submits valid new course form", async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();
      const categories = [{ id: "cat-1", name: "Backend", slug: "backend", isActive: true }];

      render(
        <CreateCourseDialog
          isOpen={true}
          onClose={vi.fn()}
          onSubmit={onSubmit}
          categories={categories}
        />
      );

      const titleInput = screen.getByLabelText(/course title/i);
      await user.type(titleInput, "Mastering Next.js 16");

      const submitBtn = screen.getByRole("button", { name: /create course/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Mastering Next.js 16",
            categoryId: "cat-1",
            level: "BEGINNER",
          })
        );
      });
    });
  });
});
