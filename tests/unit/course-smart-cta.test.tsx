import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CourseSmartCTA } from "@/components/courses/course-smart-cta";
import type { User } from "@/types/api";

const mockCourseId = "course-123";
const mockCourseSlug = "nest-microservices";
const mockTeacherId = "teacher-alex";

describe("CourseSmartCTA Component", () => {
  it("renders 'Log in to Enroll' for unauthenticated guest visitors", () => {
    render(
      <CourseSmartCTA
        courseId={mockCourseId}
        courseSlug={mockCourseSlug}
        teacherId={mockTeacherId}
        user={null}
        isEnrolled={false}
        isLoadingEnrollment={false}
        onEnroll={vi.fn()}
      />,
    );

    const loginLink = screen.getByRole("link", { name: /Log in to Enroll/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", `/login?redirect=/courses/${mockCourseId}`);
  });

  it("renders 'Enroll in Course' for authenticated student who is not enrolled", async () => {
    const userEventObj = userEvent.setup();
    const handleEnroll = vi.fn();
    const studentUser: User = {
      id: "student-1",
      email: "student@example.com",
      fullName: "Student One",
      role: "STUDENT",
      isActive: true,
    };

    render(
      <CourseSmartCTA
        courseId={mockCourseId}
        courseSlug={mockCourseSlug}
        teacherId={mockTeacherId}
        user={studentUser}
        isEnrolled={false}
        isLoadingEnrollment={false}
        onEnroll={handleEnroll}
      />,
    );

    const enrollBtn = screen.getByRole("button", { name: /Enroll in Course/i });
    expect(enrollBtn).toBeInTheDocument();

    await userEventObj.click(enrollBtn);
    expect(handleEnroll).toHaveBeenCalled();
  });

  it("renders 'Continue Learning' for enrolled student", () => {
    const studentUser: User = {
      id: "student-1",
      email: "student@example.com",
      fullName: "Student One",
      role: "STUDENT",
      isActive: true,
    };

    render(
      <CourseSmartCTA
        courseId={mockCourseId}
        courseSlug={mockCourseSlug}
        teacherId={mockTeacherId}
        user={studentUser}
        isEnrolled={true}
        isLoadingEnrollment={false}
        onEnroll={vi.fn()}
      />,
    );

    const continueLink = screen.getByRole("link", { name: /Continue Learning/i });
    expect(continueLink).toBeInTheDocument();
    expect(continueLink).toHaveAttribute("href", `/learn/${mockCourseId}`);
  });

  it("renders 'Edit in Course Builder' for the Teacher who owns the course", () => {
    const teacherOwner: User = {
      id: mockTeacherId,
      email: "alex@example.com",
      fullName: "Alex Rivera",
      role: "TEACHER",
      isActive: true,
    };

    render(
      <CourseSmartCTA
        courseId={mockCourseId}
        courseSlug={mockCourseSlug}
        teacherId={mockTeacherId}
        user={teacherOwner}
        isEnrolled={false}
        isLoadingEnrollment={false}
        onEnroll={vi.fn()}
      />,
    );

    const editLink = screen.getByRole("link", { name: /Edit in Course Builder/i });
    expect(editLink).toBeInTheDocument();
    expect(editLink).toHaveAttribute("href", `/teacher/courses/${mockCourseId}/builder`);
  });

  it("renders 'Edit in Course Builder' for Admin users", () => {
    const adminUser: User = {
      id: "admin-1",
      email: "admin@example.com",
      fullName: "Admin",
      role: "ADMIN",
      isActive: true,
    };

    render(
      <CourseSmartCTA
        courseId={mockCourseId}
        courseSlug={mockCourseSlug}
        teacherId={mockTeacherId}
        user={adminUser}
        isEnrolled={false}
        isLoadingEnrollment={false}
        onEnroll={vi.fn()}
      />,
    );

    const editLink = screen.getByRole("link", { name: /Edit in Course Builder/i });
    expect(editLink).toBeInTheDocument();
  });

  it("renders preview indicator for non-owner Teachers", () => {
    const otherTeacher: User = {
      id: "teacher-other",
      email: "other@example.com",
      fullName: "Other Teacher",
      role: "TEACHER",
      isActive: true,
    };

    render(
      <CourseSmartCTA
        courseId={mockCourseId}
        courseSlug={mockCourseSlug}
        teacherId={mockTeacherId}
        user={otherTeacher}
        isEnrolled={false}
        isLoadingEnrollment={false}
        onEnroll={vi.fn()}
      />,
    );

    expect(screen.getByText(/Teacher Preview Mode/i)).toBeInTheDocument();
  });
});
