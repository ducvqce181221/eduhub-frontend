import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CoursePreviewModal } from "@/components/courses/course-preview-modal";

describe("CoursePreviewModal Component", () => {
  const mockOnClose = vi.fn();
  const mockOnEnroll = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <CoursePreviewModal
        isOpen={false}
        onClose={mockOnClose}
        courseTitle="Advanced Microservices"
        courseId="course-1"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders video element, lesson title, and duration when open with preview data", () => {
    render(
      <CoursePreviewModal
        isOpen={true}
        onClose={mockOnClose}
        courseTitle="Advanced Microservices"
        courseId="course-1"
        previewData={{
          courseId: "course-1",
          lessonId: "les-1",
          lessonTitle: "1. Introduction to Event Sourcing",
          durationSeconds: 720,
          previewUrl: "https://r2.eduhub.dev/preview/intro.mp4",
        }}
      />
    );

    expect(screen.getByText("1. Introduction to Event Sourcing")).toBeInTheDocument();
    expect(screen.getByText(/Introductory lesson: 12m 00s/i)).toBeInTheDocument();
    const video = document.querySelector("video");
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute("src", "https://r2.eduhub.dev/preview/intro.mp4");
  });

  it("calls onClose when clicking close button", () => {
    render(
      <CoursePreviewModal
        isOpen={true}
        onClose={mockOnClose}
        courseTitle="Advanced Microservices"
        courseId="course-1"
      />
    );

    const closeBtn = screen.getByRole("button", { name: /Close/i });
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("does not render action buttons in preview modal", () => {
    render(
      <CoursePreviewModal
        isOpen={true}
        onClose={mockOnClose}
        courseTitle="Advanced Microservices"
        courseId="course-1"
        isEnrolled={true}
      />
    );

    expect(screen.queryByText(/Go to Course/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Enroll Now/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Log in to Enroll/i)).not.toBeInTheDocument();
  });
});
