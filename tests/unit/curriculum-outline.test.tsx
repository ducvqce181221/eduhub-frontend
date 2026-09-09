import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CurriculumOutline } from "@/components/courses/curriculum-outline";
import type { Chapter } from "@/types/api";

const mockChapters: Chapter[] = [
  {
    id: "chap-1",
    title: "1. Foundations of Enterprise Architecture",
    description: "Overview of domain modularity and database configurations.",
    order: 1,
    lessons: [
      {
        id: "les-1",
        title: "Introduction to NestJS & Clean Architecture",
        order: 1,
        video: { id: "vid-1", videoUrl: "https://example.com/v1.mp4", durationSeconds: 630 },
        resources: [{ id: "res-1", name: "Architecture_Diagram.pdf", fileUrl: "https://example.com/arch.pdf" }],
        quiz: null,
      },
      {
        id: "les-2",
        title: "Configuring Prisma 7 with Postgres Driver Adapter",
        order: 2,
        video: { id: "vid-2", videoUrl: "https://example.com/v2.mp4", durationSeconds: 845 },
        resources: [],
        quiz: { id: "quiz-1", title: "Prisma Knowledge Check", passScore: 80 },
      },
    ],
  },
  {
    id: "chap-2",
    title: "2. Asynchronous Messaging with RabbitMQ",
    description: "Event-driven design patterns and dead-letter queues.",
    order: 2,
    lessons: [
      {
        id: "les-3",
        title: "Publish-Subscribe Events in Distributed Systems",
        order: 1,
        video: { id: "vid-3", videoUrl: "https://example.com/v3.mp4", durationSeconds: 1200 },
        resources: [],
        quiz: null,
      },
    ],
  },
];

describe("CurriculumOutline Component", () => {
  it("renders chapter titles and lesson counts", () => {
    render(<CurriculumOutline chapters={mockChapters} />);

    expect(screen.getByText("1. Foundations of Enterprise Architecture")).toBeInTheDocument();
    expect(screen.getByText("2. Asynchronous Messaging with RabbitMQ")).toBeInTheDocument();
    expect(screen.getByText("2 lessons")).toBeInTheDocument();
    expect(screen.getByText("1 lesson")).toBeInTheDocument();
  });

  it("renders lessons with formatted durations and indicator tags", () => {
    render(<CurriculumOutline chapters={mockChapters} defaultExpanded />);

    expect(screen.getByText("Introduction to NestJS & Clean Architecture")).toBeInTheDocument();
    expect(screen.getByText("10m 30s")).toBeInTheDocument();
    expect(screen.getByText(/1 resource/i)).toBeInTheDocument();

    expect(screen.getByText("Configuring Prisma 7 with Postgres Driver Adapter")).toBeInTheDocument();
    expect(screen.getByText("14m 05s")).toBeInTheDocument();
    expect(screen.getByText(/Quiz/i)).toBeInTheDocument();
  });

  it("allows expanding and collapsing chapter items", async () => {
    const user = userEvent.setup();
    render(<CurriculumOutline chapters={mockChapters} />);

    const chapter2Header = screen.getByText("2. Asynchronous Messaging with RabbitMQ");
    await user.click(chapter2Header);

    expect(screen.getByText("Publish-Subscribe Events in Distributed Systems")).toBeInTheDocument();
  });

  it("renders total curriculum summary (total chapters and total duration)", () => {
    render(<CurriculumOutline chapters={mockChapters} showSummary />);

    expect(screen.getByText(/2 chapters/i)).toBeInTheDocument();
    expect(screen.getByText(/3 lessons/i)).toBeInTheDocument();
    expect(screen.getByText(/44m 35s/i)).toBeInTheDocument();
  });
});
