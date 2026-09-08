import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PublishChecklistModal } from "@/components/teacher/publish-checklist-modal";

describe("PublishChecklistModal (BR-CRS-02)", () => {
  const mockChecklistState = {
    hasMetadata: true,
    hasChapters: true,
    hasLessons: false, // failing: a chapter is empty
    hasVideos: false,  // failing: some lessons missing video
    hasValidQuizzes: true,
    details: [
      "Chapter 2 has no lessons",
      "Lesson 'Setup' is missing an uploaded video",
    ],
  };

  it("renders checklist modal with pass and fail criteria badges", () => {
    render(
      <PublishChecklistModal
        isOpen={true}
        onClose={vi.fn()}
        onFixSection={vi.fn()}
        checklist={mockChecklistState}
      />
    );

    expect(screen.getByText("Course Publishing Checklist")).toBeInTheDocument();
    expect(screen.getByText("Basic Information & Thumbnail")).toBeInTheDocument();
    expect(screen.getByText("Curriculum Chapters (≥ 1 Chapter)")).toBeInTheDocument();
    expect(screen.getByText("Chapter Lessons (≥ 1 Lesson per Chapter)")).toBeInTheDocument();
    expect(screen.getByText("Lesson Videos (Uploaded & Duration > 0)")).toBeInTheDocument();
    expect(screen.getByText("Lesson Quizzes (Valid Questions & Answers)")).toBeInTheDocument();

    // Specific error details
    expect(screen.getByText("Chapter 2 has no lessons")).toBeInTheDocument();
    expect(screen.getByText("Lesson 'Setup' is missing an uploaded video")).toBeInTheDocument();
  });

  it("calls onFixSection when clicking fix buttons", async () => {
    const onFixSection = vi.fn();
    const user = userEvent.setup();

    render(
      <PublishChecklistModal
        isOpen={true}
        onClose={vi.fn()}
        onFixSection={onFixSection}
        checklist={mockChecklistState}
      />
    );

    const fixButtons = screen.getAllByRole("button", { name: /fix/i });
    expect(fixButtons.length).toBeGreaterThan(0);
    await user.click(fixButtons[0]);
    expect(onFixSection).toHaveBeenCalled();
  });
});
