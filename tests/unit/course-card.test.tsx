import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CourseCard } from "@/components/courses/course-card";
import type { Course } from "@/types/api";

const mockCourse: Course = {
  id: "course-uuid-1",
  title: "Building Production Microservices with NestJS",
  slug: "building-production-microservices-with-nestjs",
  description: "Master modern microservices architecture using NestJS, RabbitMQ, and Redis with enterprise patterns.",
  thumbnailUrl: "https://example.com/thumbnail.webp",
  level: "INTERMEDIATE",
  status: "PUBLISHED",
  categoryId: "cat-1",
  category: {
    id: "cat-1",
    name: "Backend Development",
    slug: "backend-development",
    isActive: true,
  },
  teacherId: "teacher-1",
  teacher: {
    id: "teacher-1",
    fullName: "Alex Rivera",
    email: "alex@example.com",
    avatarUrl: "https://example.com/alex.webp",
  },
  _count: {
    chapters: 5,
    enrollments: 142,
  },
};

describe("CourseCard Component", () => {
  it("renders course title and description", () => {
    render(<CourseCard course={mockCourse} />);

    expect(screen.getByText("Building Production Microservices with NestJS")).toBeInTheDocument();
    expect(
      screen.getByText(/Master modern microservices architecture/i),
    ).toBeInTheDocument();
  });

  it("renders category and level badges with Notion sticker styling", () => {
    render(<CourseCard course={mockCourse} />);

    expect(screen.getByText("Backend Development")).toBeInTheDocument();
    expect(screen.getByText("Intermediate")).toBeInTheDocument();
  });

  it("renders teacher information (avatar/initials and full name)", () => {
    render(<CourseCard course={mockCourse} />);

    expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
  });

  it("renders chapter count and enrollment statistics", () => {
    render(<CourseCard course={mockCourse} />);

    expect(screen.getByText("5 chapters")).toBeInTheDocument();
    expect(screen.getByText(/142/)).toBeInTheDocument();
  });

  it("links to the course detail page via /courses/[id]", () => {
    render(<CourseCard course={mockCourse} />);

    const link = screen.getByRole("link", { name: /Building Production Microservices/i });
    expect(link).toHaveAttribute("href", "/courses/course-uuid-1");
  });

  it("renders placeholder gracefully when thumbnailUrl is null", () => {
    const courseWithoutThumb = { ...mockCourse, thumbnailUrl: null };
    render(<CourseCard course={courseWithoutThumb} />);

    expect(screen.getByText("Building Production Microservices with NestJS")).toBeInTheDocument();
  });
});
