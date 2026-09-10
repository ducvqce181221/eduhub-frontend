import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EnrolledStudentsTable } from "@/components/teacher/enrolled-students-table";
import * as LanguageContext from "@/lib/i18n/language-context";
import { vi as viDict } from "@/lib/i18n/dictionaries/vi";
import type { EnrolledStudentProgressItem, CourseAggregateProgress } from "@/types/api";

const mockStudents: EnrolledStudentProgressItem[] = [
  {
    studentId: "s-1",
    fullName: "Alice Wonderland",
    email: "alice@example.com",
    avatarUrl: null,
    enrolledAt: "2026-08-25T09:00:00.000Z",
    completedLessons: 10,
    totalLessons: 10,
    progressPercentage: 100,
    isCompleted: true,
  },
  {
    studentId: "s-2",
    fullName: "Bob Builder",
    email: "bob@example.com",
    avatarUrl: null,
    enrolledAt: "2026-08-28T14:30:00.000Z",
    completedLessons: 4,
    totalLessons: 10,
    progressPercentage: 40,
    isCompleted: false,
  },
];

const mockMetrics: CourseAggregateProgress = {
  totalEnrollments: 2,
  completedCount: 1,
  averageProgressPercentage: 70,
};

describe("EnrolledStudentsTable & Analytics (FR-E03, BR-PRG-04)", () => {
  it("renders aggregate metric summary cards", () => {
    render(<EnrolledStudentsTable students={mockStudents} metrics={mockMetrics} isLoading={false} />);

    expect(screen.getByText("2")).toBeInTheDocument(); // total enrollments
    expect(screen.getByText("1")).toBeInTheDocument(); // completed count
    expect(screen.getByText("70%")).toBeInTheDocument(); // average progress
  });

  it("renders table rows with student name, progress, and completion badge", () => {
    render(<EnrolledStudentsTable students={mockStudents} metrics={mockMetrics} isLoading={false} />);

    expect(screen.getByText("Alice Wonderland")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("10/10")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();

    expect(screen.getByText("Bob Builder")).toBeInTheDocument();
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
    expect(screen.getByText("4/10")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();

    // Formatted dates in English (MM/dd/yyyy)
    expect(screen.getByText("08/25/2026")).toBeInTheDocument();
    expect(screen.getByText("08/28/2026")).toBeInTheDocument();
  });

  it("formats enrolled date as dd/MM/yyyy for Vietnamese", () => {
    const spy = vi.spyOn(LanguageContext, "useTranslation").mockReturnValue({
      language: "vi",
      t: viDict,
      switchLanguage: vi.fn(),
      setLanguage: vi.fn(),
      toggleLanguage: vi.fn(),
      isPending: false,
    });

    render(<EnrolledStudentsTable students={mockStudents} metrics={mockMetrics} isLoading={false} />);

    expect(screen.getByText("25/08/2026")).toBeInTheDocument();
    expect(screen.getByText("28/08/2026")).toBeInTheDocument();
    spy.mockRestore();
  });

  it("renders empty state when no students have enrolled yet", () => {
    render(<EnrolledStudentsTable students={[]} metrics={mockMetrics} isLoading={false} />);

    expect(screen.getByText(/no students have enrolled in this course yet/i)).toBeInTheDocument();
  });
});
