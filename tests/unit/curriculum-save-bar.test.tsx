import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CurriculumTree } from "@/components/teacher/curriculum-tree";
import type { Chapter } from "@/types/api";

const mockChapters: Chapter[] = [
  {
    id: "ch-1",
    title: "1. Chapter One",
    order: 1,
    lessons: [
      { id: "les-1", title: "1.1 Lesson One", order: 1 },
      { id: "les-2", title: "1.2 Lesson Two", order: 2 },
    ],
  },
  {
    id: "ch-2",
    title: "2. Chapter Two",
    order: 2,
    lessons: [
      { id: "les-3", title: "2.1 Lesson Three", order: 1 },
    ],
  },
];

let dragEndHandlers: ((event: any) => void)[] = [];

vi.mock("@dnd-kit/react", () => ({
  DragDropProvider: ({ children, onDragEnd }: any) => {
    dragEndHandlers.push(onDragEnd);
    return <div data-testid="dnd-provider">{children}</div>;
  },
}));

vi.mock("@dnd-kit/react/sortable", () => ({
  useSortable: ({ id, group }: any) => ({
    ref: (el: any) => el,
    handleRef: (el: any) => el,
    sortable: { id, group },
    isDragging: false,
    isDropping: false,
    isDragSource: false,
    isDropTarget: false,
  }),
  isSortable: (el: any) => Boolean(el?.sortable),
}));

describe("CurriculumTree Option 2 Save Changes Bar", () => {
  beforeEach(() => {
    dragEndHandlers = [];
  });

  it("shows unsaved changes bar when reordering occurs, and saves correctly via onSaveAllReorder", async () => {
    const user = userEvent.setup();
    const onSaveAllReorder = vi.fn().mockResolvedValue(undefined);
    const onReorderChapters = vi.fn();
    const onReorderLessons = vi.fn();

    render(
      <CurriculumTree
        chapters={mockChapters}
        isPublished={false}
        onAddChapter={vi.fn()}
        onUpdateChapter={vi.fn()}
        onDeleteChapter={vi.fn()}
        onReorderChapters={onReorderChapters}
        onAddLesson={vi.fn()}
        onUpdateLesson={vi.fn()}
        onDeleteLesson={vi.fn()}
        onReorderLessons={onReorderLessons}
        onSelectLesson={vi.fn()}
        onSaveAllReorder={onSaveAllReorder}
      />
    );

    // Initially, no unsaved changes bar
    expect(screen.queryByTestId("unsaved-reorder-bar")).not.toBeInTheDocument();

    // Trigger chapter dragEnd via outer DragDropProvider (index 0): move ch-1 to ch-2
    expect(dragEndHandlers[0]).toBeDefined();
    await act(async () => {
      dragEndHandlers[0]({
        operation: {
          source: { id: "ch-1" },
          target: { id: "ch-2" },
        },
      });
    });

    // Unsaved bar should now appear
    const bar = await screen.findByTestId("unsaved-reorder-bar");
    expect(bar).toBeInTheDocument();
    expect(screen.getByText("You have unsaved curriculum changes")).toBeInTheDocument();

    const saveBtn = screen.getByTestId("save-reorder-btn");
    expect(saveBtn).toHaveTextContent("Save Changes");

    const discardBtn = screen.getByTestId("discard-reorder-btn");
    expect(discardBtn).toHaveTextContent("Discard");

    // Click Save Changes
    await user.click(saveBtn);

    await waitFor(() => {
      expect(onSaveAllReorder).toHaveBeenCalledTimes(1);
    });

    expect(onSaveAllReorder).toHaveBeenCalledWith({
      chapterOrders: {
        orders: [
          { id: "ch-2", order: 1 },
          { id: "ch-1", order: 2 },
        ],
      },
      lessonOrders: expect.any(Array),
    });

    // Bar should disappear after save
    expect(screen.queryByTestId("unsaved-reorder-bar")).not.toBeInTheDocument();
  });

  it("discards unsaved reorder changes when Discard button is clicked", async () => {
    const user = userEvent.setup();
    const onSaveAllReorder = vi.fn();

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
        onSaveAllReorder={onSaveAllReorder}
      />
    );

    // Trigger chapter dragEnd via outer provider
    expect(dragEndHandlers[0]).toBeDefined();
    await act(async () => {
      dragEndHandlers[0]({
        operation: {
          source: { id: "ch-1" },
          target: { id: "ch-2" },
        },
      });
    });

    const discardBtn = await screen.findByTestId("discard-reorder-btn");
    await user.click(discardBtn);

    // Save should not be called and bar should disappear
    expect(onSaveAllReorder).not.toHaveBeenCalled();
    expect(screen.queryByTestId("unsaved-reorder-bar")).not.toBeInTheDocument();
  });
});
