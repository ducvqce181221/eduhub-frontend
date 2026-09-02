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
    expect(screen.getByText("6 / 10 lessons")).toBeInTheDocument();
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
    expect(resumeLink).toHaveAttribute("href", "/learn/course-1");
  });
});
