import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LearningSidebar } from "@/components/learn/learning-sidebar";
import type { Chapter } from "@/types/api";

const mockChapters: Chapter[] = [
  {
    id: "chap-1",
    title: "1. Core Architecture",
    order: 1,
    lessons: [
      {
        id: "les-1",
        title: "Introduction to NestJS",
        order: 1,
        video: { id: "v-1", videoUrl: "https://example.com/v1.mp4", durationSeconds: 600 },
        resources: [],
        quiz: null,
      },
      {
        id: "les-2",
        title: "Dependency Injection in Depth",
        order: 2,
        video: { id: "v-2", videoUrl: "https://example.com/v2.mp4", durationSeconds: 900 },
        resources: [],
        quiz: { id: "q-1", title: "Quiz 1", passScore: 80 },
      },
    ],
  },
  {
    id: "chap-2",
    title: "2. Database Integration",
    order: 2,
    lessons: [
      {
        id: "les-3",
        title: "Prisma ORM Setup",
        order: 1,
        video: { id: "v-3", videoUrl: "https://example.com/v3.mp4", durationSeconds: 800 },
        resources: [],
        quiz: null,
      },
    ],
  },
];

describe("LearningSidebar Component", () => {
  it("renders course title, progress percentage, and progress bar", () => {
    render(
      <LearningSidebar
        courseId="course-1"
        courseTitle="Fullstack NestJS Masterclass"
        chapters={mockChapters}
        activeLessonId="les-1"
        completedLessonIds={["les-1"]}
        progressPercentage={33.33}
        onSelectLesson={vi.fn()}
      />,
    );

    expect(screen.getByText("Fullstack NestJS Masterclass")).toBeInTheDocument();
    expect(screen.getByText(/33% Complete/i)).toBeInTheDocument();
    expect(screen.getByText(/1 of 3 lessons/i)).toBeInTheDocument();
  });

  it("marks completed lessons with checkmarks and indicates active lesson", () => {
    render(
      <LearningSidebar
        courseId="course-1"
        courseTitle="Fullstack NestJS Masterclass"
        chapters={mockChapters}
        activeLessonId="les-1"
        completedLessonIds={["les-1"]}
        progressPercentage={33.33}
        onSelectLesson={vi.fn()}
      />,
    );

    // Active lesson item
    const activeItem = screen.getByText("Introduction to NestJS");
    expect(activeItem).toBeInTheDocument();

    // Inactive lesson item
    expect(screen.getByText("Dependency Injection in Depth")).toBeInTheDocument();
  });

  it("calls onSelectLesson when user clicks a lesson item", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(
      <LearningSidebar
        courseId="course-1"
        courseTitle="Fullstack NestJS Masterclass"
        chapters={mockChapters}
        activeLessonId="les-1"
        completedLessonIds={[]}
        progressPercentage={0}
        onSelectLesson={handleSelect}
      />,
    );

    const lesson2 = screen.getByText("Dependency Injection in Depth");
    await user.click(lesson2);

    expect(handleSelect).toHaveBeenCalledWith("les-2");
  });
});
