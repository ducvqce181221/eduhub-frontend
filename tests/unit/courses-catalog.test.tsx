import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CourseGrid } from "@/components/courses/course-grid";
import type { Course } from "@/types/api";

const mockCourses: Course[] = [
  {
    id: "course-1",
    title: "TypeScript Deep Dive",
    slug: "typescript-deep-dive",
    description: "Advanced types and generics in TypeScript.",
    level: "ADVANCED",
    status: "PUBLISHED",
    categoryId: "cat-1",
    category: { id: "cat-1", name: "Frontend", slug: "frontend", isActive: true },
    teacherId: "teacher-1",
    teacher: { id: "teacher-1", fullName: "Jane Doe", email: "jane@example.com" },
    _count: { chapters: 4, enrollments: 88 },
  },
];

describe("CourseGrid Component", () => {
  it("renders loading skeletons when isLoading is true", () => {
    const { container } = render(<CourseGrid courses={[]} isLoading={true} />);

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders empty state with clear filters CTA when courses is empty and not loading", async () => {
    const handleReset = vi.fn();
    const user = userEvent.setup();

    render(
      <CourseGrid
        courses={[]}
        isLoading={false}
        hasActiveFilters={true}
        onResetFilters={handleReset}
      />,
    );

    expect(screen.getByText(/No courses found/i)).toBeInTheDocument();
    const resetBtn = screen.getByRole("button", { name: /Clear all filters/i });
    expect(resetBtn).toBeInTheDocument();

    await user.click(resetBtn);
    expect(handleReset).toHaveBeenCalled();
  });

  it("renders list of CourseCards when courses are provided", () => {
    render(<CourseGrid courses={mockCourses} isLoading={false} />);

    expect(screen.getByText("TypeScript Deep Dive")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Advanced")).toBeInTheDocument();
  });
});
