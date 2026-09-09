import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EnrolledCourseCard } from "@/components/enrollments/enrolled-course-card";
import type { Enrollment } from "@/types/api";

const mockEnrollment: Enrollment = {
  id: "enr-1",
  studentId: "stud-1",
  courseId: "course-1",
  status: "ACTIVE",
  enrolledAt: new Date().toISOString(),
  course: {
    id: "course-1",
    title: "Fullstack NestJS Masterclass",
    slug: "fullstack-nestjs-masterclass",
    description: "Enterprise fullstack course.",
    level: "INTERMEDIATE",
    status: "PUBLISHED",
    categoryId: "cat-1",
    category: { id: "cat-1", name: "Web Dev", slug: "web-dev", isActive: true },
    teacherId: "teacher-1",
    teacher: { id: "teacher-1", fullName: "John Doe", email: "john@example.com" },
    _count: { chapters: 4, enrollments: 88 },
  },
};

describe("EnrolledCourseCard Component", () => {
  it("renders enrolled course title, category badge, and instructor name", () => {
    render(
      <EnrolledCourseCard
        enrollment={mockEnrollment}
        progressPercentage={60}
        completedLessons={6}
        totalLessons={10}
      />,
    );

    expect(screen.getByText("Fullstack NestJS Masterclass")).toBeInTheDocument();
    expect(screen.getByText("Web Dev")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders progress percentage and completed lessons count", () => {
    render(
      <EnrolledCourseCard
        enrollment={mockEnrollment}
        progressPercentage={60}
        completedLessons={6}
        totalLessons={10}
      />,
    );

    expect(screen.getByText("60% Complete")).toBeInTheDocument();
    expect(screen.getByText("6 of 10 lessons")).toBeInTheDocument();
  });

  it("links directly to the learning player route /learn/[courseId]", () => {
    render(
      <EnrolledCourseCard
        enrollment={mockEnrollment}
        progressPercentage={60}
        completedLessons={6}
        totalLessons={10}
      />,
    );

    const resumeLink = screen.getByRole("link", { name: /Resume Learning/i });
    expect(resumeLink).toHaveAttribute("href", "/en/learn/course-1");
  });
});

let mockCurrentUser: any = null;
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
}));

vi.mock("@/lib/auth/auth-context", () => ({
  useAuth: () => ({
    user: mockCurrentUser,
    isAuthenticated: Boolean(mockCurrentUser),
    isLoading: false,
  }),
}));

vi.mock("@/hooks/use-course-catalog", () => ({
  useMyEnrollmentsQuery: () => ({
    data: [mockEnrollment],
    isLoading: false,
  }),
}));

vi.mock("@/hooks/use-student-learning", () => ({
  useCourseProgressQuery: () => ({
    data: { progressPercentage: 50, completedLessons: 2, totalLessons: 4 },
    isLoading: false,
  }),
}));

import MyEnrollmentsPage from "@/app/[locale]/(student)/me/enrollments/page";

describe("MyEnrollmentsPage Role Redirects", () => {
  it("redirects ADMIN to /admin and renders nothing", () => {
    mockReplace.mockClear();
    mockCurrentUser = { id: "a1", role: "ADMIN", email: "admin@test.com" };

    const { container } = render(<MyEnrollmentsPage />);
    expect(mockReplace).toHaveBeenCalledWith("/en/admin");
    expect(container.firstChild).toBeNull();
  });

  it("redirects TEACHER to /teacher and renders nothing", () => {
    mockReplace.mockClear();
    mockCurrentUser = { id: "t1", role: "TEACHER", email: "teacher@test.com" };

    const { container } = render(<MyEnrollmentsPage />);
    expect(mockReplace).toHaveBeenCalledWith("/en/teacher");
    expect(container.firstChild).toBeNull();
  });

  it("renders enrolled courses for STUDENT", () => {
    mockReplace.mockClear();
    mockCurrentUser = { id: "s1", role: "STUDENT", email: "student@test.com" };

    render(<MyEnrollmentsPage />);
    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByText("My Learning")).toBeInTheDocument();
    expect(screen.getByText("Fullstack NestJS Masterclass")).toBeInTheDocument();
  });
});
