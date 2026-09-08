import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "@/components/layout/header";

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/auth/auth-context", () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

vi.mock("@/hooks/use-course-catalog", () => ({
  useCategoriesQuery: () => ({
    data: [
      {
        id: "cat-1",
        name: "Backend Engineering",
        slug: "backend",
        description: "Node.js, NestJS, and PostgreSQL",
        isActive: true,
        _count: { courses: 10 },
      },
      {
        id: "cat-2",
        name: "DevOps & Cloud",
        slug: "devops",
        description: "Docker, Kubernetes, and AWS",
        isActive: true,
        _count: { courses: 4 },
      },
    ],
    isLoading: false,
  }),
}));

describe("Header Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Brand logo, Explore button, and global search bar in English", () => {
    render(<Header />);

    expect(screen.getByText("EduHub")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Explore course categories/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search courses, topics, instructors\.\.\./i)).toBeInTheDocument();
    expect(screen.queryByText(/^Courses$/i)).not.toBeInTheDocument(); // Courses nav tab removed
  });

  it("opens Explore popover on click and lists categories with course counts", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const exploreBtn = screen.getByRole("button", { name: /Explore course categories/i });
    await user.click(exploreBtn);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /categories/i })).toBeInTheDocument();
      expect(screen.getByText("Backend Engineering")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("DevOps & Cloud")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
    });
  });

  it("triggers search navigation when user submits header search", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const searchInput = screen.getByPlaceholderText(/Search courses, topics, instructors\.\.\./i);
    await user.type(searchInput, "Docker{Enter}");

    expect(searchInput).toHaveValue("Docker");
  });

  it("renders 'My Enrollments' for STUDENT role, but hides it for TEACHER and ADMIN", () => {
    // 1. Student
    const { unmount: unmountStudent } = render(
      <Header
        initialUser={{
          id: "s1",
          email: "student@test.com",
          fullName: "Student One",
          role: "STUDENT",
          isActive: true,
        }}
      />
    );
    expect(screen.getByText("My Enrollments")).toBeInTheDocument();
    expect(screen.queryByText("Teacher Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();
    unmountStudent();

    // 2. Teacher
    const { unmount: unmountTeacher } = render(
      <Header
        initialUser={{
          id: "t1",
          email: "teacher@test.com",
          fullName: "Teacher One",
          role: "TEACHER",
          isActive: true,
        }}
      />
    );
    expect(screen.queryByText("My Enrollments")).not.toBeInTheDocument();
    expect(screen.getByText("Teacher Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();
    unmountTeacher();

    // 3. Admin
    render(
      <Header
        initialUser={{
          id: "a1",
          email: "admin@test.com",
          fullName: "Admin One",
          role: "ADMIN",
          isActive: true,
        }}
      />
    );
    expect(screen.queryByText("My Enrollments")).not.toBeInTheDocument();
    expect(screen.getByText("Teacher Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });
});
