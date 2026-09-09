import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CurriculumTree } from "@/components/teacher/curriculum-tree";
import type { Chapter } from "@/types/api";

const mockChapters: Chapter[] = [
  {
    id: "ch-1",
    title: "1. Getting Started",
    order: 1,
    lessons: [
      {
        id: "les-1",
        title: "1.1 Installation",
        order: 1,
        video: { id: "v-1", videoUrl: "https://r2.dev/video1.mp4", durationSeconds: 240 },
        quiz: { id: "q-1", title: "Installation Quiz", passScore: 80 },
        resources: [{ id: "r-1", name: "Cheatsheet.pdf", fileUrl: "https://r2.dev/cheat.pdf" }],
      },
      {
        id: "les-2",
        title: "1.2 Project Setup",
        order: 2,
        video: null,
        quiz: null,
      },
    ],
  },
  {
    id: "ch-2",
    title: "2. Deep Dive",
    order: 2,
    lessons: [
      {
        id: "les-3",
        title: "2.1 Advanced Concepts",
        order: 1,
        video: { id: "v-3", videoUrl: "https://r2.dev/video3.mp4", durationSeconds: 500 },
      },
    ],
  },
];

describe("CurriculumTree & Sortable Reordering (BR-CRS-05, BR-CRS-06)", () => {
  it("renders chapters and nested lessons with media indicators", () => {
    render(
      <CurriculumTree
        chapters={mockChapters}
        isPublished={false}
        onAddChapter={vi.fn()}
        onUpdateChapter={vi.fn()}
        onDeleteChapter={vi.fn()}
        onReorderChapters={vi.fn()}
        onAddLesson={vi.fn()}
        onUpdateLesson={vi.fn()}
        onDeleteLesson={vi.fn()}
        onReorderLessons={vi.fn()}
        onSelectLesson={vi.fn()}
      />
    );

    expect(screen.getByText("1. Getting Started")).toBeInTheDocument();
    expect(screen.getByText("1.1 Installation")).toBeInTheDocument();
    expect(screen.getByText("1.2 Project Setup")).toBeInTheDocument();
    expect(screen.getByText("2. Deep Dive")).toBeInTheDocument();
    expect(screen.getByText("2.1 Advanced Concepts")).toBeInTheDocument();

    // Media indicators
    expect(screen.getByText("Quiz")).toBeInTheDocument();
    expect(screen.getByText("4m 00s")).toBeInTheDocument();
  });

  it("calls onSelectLesson when clicking a lesson item", async () => {
    const onSelectLesson = vi.fn();
    const user = userEvent.setup();

    render(
      <CurriculumTree
        chapters={mockChapters}
        isPublished={false}
        onAddChapter={vi.fn()}
        onUpdateChapter={vi.fn()}
        onDeleteChapter={vi.fn()}
        onReorderChapters={vi.fn()}
        onAddLesson={vi.fn()}
        onUpdateLesson={vi.fn()}
        onDeleteLesson={vi.fn()}
        onReorderLessons={vi.fn()}
        onSelectLesson={onSelectLesson}
      />
    );

    const lessonItem = screen.getByText("1.1 Installation");
    await user.click(lessonItem);
    expect(onSelectLesson).toHaveBeenCalledWith(mockChapters[0].lessons[0]);
  });

  it("blocks chapter deletion with tooltip when published course has only 1 chapter (BR-CRS-06)", () => {
    const singleChapterList: Chapter[] = [
      {
        id: "ch-only",
        title: "Sole Chapter",
        order: 1,
        lessons: [
          { id: "les-only", title: "Sole Lesson", order: 1, video: { id: "v-1", videoUrl: "url", durationSeconds: 100 } },
        ],
      },
    ];

    render(
      <CurriculumTree
        chapters={singleChapterList}
        isPublished={true}
        onAddChapter={vi.fn()}
        onUpdateChapter={vi.fn()}
        onDeleteChapter={vi.fn()}
        onReorderChapters={vi.fn()}
        onAddLesson={vi.fn()}
        onUpdateLesson={vi.fn()}
        onDeleteLesson={vi.fn()}
        onReorderLessons={vi.fn()}
        onSelectLesson={vi.fn()}
      />
    );

    const deleteChapterBtn = screen.getByTestId("delete-chapter-ch-only");
    expect(deleteChapterBtn).toBeDisabled();
    expect(deleteChapterBtn).toHaveAttribute(
      "title",
      "Cannot delete the last lesson/chapter of a published course. Please unpublish first."
    );

    const deleteLessonBtn = screen.getByTestId("delete-lesson-les-only");
    expect(deleteLessonBtn).toBeDisabled();
    expect(deleteLessonBtn).toHaveAttribute(
      "title",
      "Cannot delete the last lesson/chapter of a published course. Please unpublish first."
    );
  });

  it("renders dedicated drag handles with correct accessible labels for chapters and lessons", () => {
    render(
      <CurriculumTree
        chapters={mockChapters}
        isPublished={false}
        onAddChapter={vi.fn()}
        onUpdateChapter={vi.fn()}
        onDeleteChapter={vi.fn()}
        onReorderChapters={vi.fn()}
        onAddLesson={vi.fn()}
        onUpdateLesson={vi.fn()}
        onDeleteLesson={vi.fn()}
        onReorderLessons={vi.fn()}
        onSelectLesson={vi.fn()}
      />
    );

    // Dedicated drag handle for Chapter 1
    const chapter1Handle = screen.getByTestId("drag-chapter-ch-1");
    expect(chapter1Handle).toBeInTheDocument();
    expect(chapter1Handle).toHaveAttribute("aria-label", "Drag to reorder chapter");

    // Dedicated drag handle for Lesson 1
    const lesson1Handle = screen.getByTestId("drag-lesson-les-1");
    expect(lesson1Handle).toBeInTheDocument();
    expect(lesson1Handle).toHaveAttribute("aria-label", "Drag to reorder lesson");

    // Chapter Card container contains both the header and its lessons as a single unit
    const chapterCard = screen.getByTestId("chapter-item-ch-1");
    expect(chapterCard).toContainElement(chapter1Handle);
    expect(chapterCard).toContainElement(screen.getByText("1.1 Installation"));
    expect(chapterCard).toContainElement(screen.getByText("1.2 Project Setup"));
  });

  it("does not display the unsaved reorder bar when no changes have been made", () => {
    render(
      <CurriculumTree
        chapters={mockChapters}
        isPublished={false}
        onAddChapter={vi.fn()}
        onUpdateChapter={vi.fn()}
        onDeleteChapter={vi.fn()}
        onReorderChapters={vi.fn()}
        onAddLesson={vi.fn()}
        onUpdateLesson={vi.fn()}
        onDeleteLesson={vi.fn()}
        onReorderLessons={vi.fn()}
        onSelectLesson={vi.fn()}
      />
    );

    expect(screen.queryByTestId("unsaved-reorder-bar")).not.toBeInTheDocument();
  });
});

