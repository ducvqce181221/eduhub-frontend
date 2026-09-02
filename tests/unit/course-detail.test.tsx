import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import CourseDetailPage from "@/app/(public)/courses/[id]/page";
import type { Course } from "@/types/api";

const mockCourse: Course = {
  id: "course-123",
  title: "Building Microservices with NestJS",
  slug: "building-microservices-with-nestjs",
  description: "Enterprise grade course description.",
  level: "INTERMEDIATE",
  status: "PUBLISHED",
  categoryId: "cat-1",
  category: { id: "cat-1", name: "Backend", slug: "backend", isActive: true },
  teacherId: "teacher-alex",
  teacher: {
    id: "teacher-alex",
    fullName: "Alex Rivera",
    email: "alex@example.com",
    avatarUrl: null,
  },
  chapters: [
    {
      id: "chap-1",
      title: "Chapter 1: Intro",
      order: 1,
      lessons: [
        {
          id: "les-1",
          title: "First Lesson",
          order: 1,
          video: { id: "v1", videoUrl: "https://example.com/v1.mp4", durationSeconds: 600 },
          resources: [],
          quiz: null,
        },
      ],
    },
  ],
  _count: {
    chapters: 1,
    enrollments: 42,
  },
};

// Mock Next.js navigation and AuthContext
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useParams: () => ({
    id: "course-123",
  }),
}));

vi.mock("@/lib/auth/auth-context", () => ({
  useAuth: () => ({
    user: {
      id: "student-1",
      email: "student@example.com",
      fullName: "Student User",
      role: "STUDENT",
      isActive: true,
    },
    isAuthenticated: true,
  }),
}));

const mockUseCourseDetailQuery = vi.fn();
const mockUseMyEnrollmentsQuery = vi.fn();
const mockUseEnrollCourseMutation = vi.fn();

vi.mock("@/hooks/use-course-catalog", () => ({
  useCourseDetailQuery: (id: string) => mockUseCourseDetailQuery(id),
  useMyEnrollmentsQuery: (enabled: boolean) => mockUseMyEnrollmentsQuery(enabled),
  useEnrollCourseMutation: () => mockUseEnrollCourseMutation(),
}));

describe("CourseDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseEnrollCourseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  it("renders loading skeleton when course is loading", () => {
    mockUseCourseDetailQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    mockUseMyEnrollmentsQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    const { container } = render(<CourseDetailPage />);

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders not found error view when course query returns error", () => {
    mockUseCourseDetailQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: { statusCode: 404, message: "Course not found" },
    });
    mockUseMyEnrollmentsQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<CourseDetailPage />);

    expect(screen.getByText(/Course Not Found/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to Course Catalog/i })).toBeInTheDocument();
  });

  it("renders course details, curriculum outline, instructor info, and CTA when loaded", () => {
    mockUseCourseDetailQuery.mockReturnValue({
      data: mockCourse,
      isLoading: false,
      error: null,
    });
    mockUseMyEnrollmentsQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<CourseDetailPage />);

    expect(
      screen.getByRole("heading", {
        name: "Building Microservices with NestJS",
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Alex Rivera").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Chapter 1: Intro")).toBeInTheDocument();
    expect(screen.getByText(/Course Highlights & Learning Outcomes/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Enroll in Course/i }).length).toBeGreaterThan(0);
  });
});
