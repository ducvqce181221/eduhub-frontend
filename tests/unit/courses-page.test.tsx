import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CoursesPage from "@/app/(public)/courses/page";

vi.mock("nuqs", () => ({
  useQueryState: (key: string, parser: any) => {
    return ["", vi.fn()];
  },
  parseAsString: {
    withDefault: () => ({
      withOptions: () => ({}),
    }),
  },
  parseAsInteger: {
    withDefault: () => ({
      withOptions: () => ({}),
    }),
  },
}));

vi.mock("@/hooks/use-course-catalog", () => ({
  useCategoriesQuery: () => ({
    data: [
      { id: "cat-1", name: "Backend", slug: "backend", isActive: true },
    ],
    isLoading: false,
  }),
  useCoursesQuery: () => ({
    data: {
      items: [
        {
          id: "c-1",
          title: "Introduction to Next.js App Router",
          slug: "intro-nextjs-app-router",
          description: "Learn Next.js 15 App Router from scratch.",
          level: "BEGINNER",
          status: "PUBLISHED",
          categoryId: "cat-1",
          category: { id: "cat-1", name: "Backend", slug: "backend", isActive: true },
          teacherId: "teacher-1",
          teacher: { id: "teacher-1", fullName: "Sarah Connor", email: "sarah@example.com" },
          _count: { chapters: 3, enrollments: 95 },
        },
      ],
      meta: {
        page: 1,
        limit: 9,
        total: 1,
        totalPages: 1,
      },
    },
    isLoading: false,
  }),
}));

describe("CoursesPage", () => {
  it("renders catalog header, filters, and courses grid", () => {
    render(<CoursesPage />);

    expect(screen.getByText("Explore Engineering & Design Courses")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search courses/i)).toBeInTheDocument();
    expect(screen.getByText("Introduction to Next.js App Router")).toBeInTheDocument();
    expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
  });
});
