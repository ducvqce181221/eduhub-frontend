import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

const mockSetSearch = vi.fn();
const mockSetCategoryId = vi.fn();
const mockSetLevel = vi.fn();
const mockSetPage = vi.fn();

vi.mock("nuqs", () => ({
  useQueryState: (key: string) => {
    if (key === "search") return ["", mockSetSearch];
    if (key === "categoryId") return ["", mockSetCategoryId];
    if (key === "level") return ["", mockSetLevel];
    if (key === "page") return [1, mockSetPage];
    return ["", vi.fn()];
  },
  parseAsString: {
    withDefault: () => ({
      withOptions: () => ({}),
    }),
  },
  parseAsInteger: {
    withDefault: () => ({
      withOptions: () => ({}),
    }),
  },
}));

let mockAuthUser: any = null;

vi.mock("@/lib/auth/auth-context", () => ({
  useAuth: () => ({
    user: mockAuthUser,
    isAuthenticated: Boolean(mockAuthUser),
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
        description: "Node.js, NestJS, and Databases",
        isActive: true,
        _count: { courses: 5 },
      },
      {
        id: "cat-2",
        name: "Frontend Development",
        slug: "frontend",
        description: "React, Next.js, and TypeScript",
        isActive: true,
        _count: { courses: 8 },
      },
    ],
    isLoading: false,
  }),
  useCoursesQuery: () => ({
    data: {
      items: [
        {
          id: "c-1",
          title: "Production NestJS Architecture",
          slug: "production-nestjs-architecture",
          description: "Build scalable microservices with NestJS.",
          level: "INTERMEDIATE",
          status: "PUBLISHED",
          categoryId: "cat-1",
          category: { id: "cat-1", name: "Backend Engineering", slug: "backend", isActive: true },
          teacherId: "teacher-1",
          teacher: { id: "teacher-1", fullName: "Sarah Connor", email: "sarah@example.com" },
          _count: { chapters: 4, enrollments: 120 },
        },
      ],
      meta: {
        page: 1,
        limit: 9,
        total: 1,
        totalPages: 1,
      },
    },
    isLoading: false,
  }),
}));

describe("HomePage (Unified Catalog)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Hero section with value proposition in English", () => {
    render(<HomePage />);

    expect(
      screen.getByText(/Master Modern Software Engineering/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/EduHub Learning Platform/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Explore Courses/i }),
    ).toBeInTheDocument();
  });

  it("renders category filters and tracks count", () => {
    render(<HomePage />);

    expect(screen.getByText(/^Categories$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Backend Engineering" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Frontend Development" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All Categories" })).toBeInTheDocument();
  });

  it("renders Course Catalog with filters, grid, and courses count", () => {
    render(<HomePage />);

    expect(screen.getByText("All Courses")).toBeInTheDocument();
    expect(screen.getByText("Production NestJS Architecture")).toBeInTheDocument();
    expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
    expect(screen.getByText(/Showing/i)).toBeInTheDocument();
  });

  it("renders Instructor / Teach on EduHub call to action banner", () => {
    render(<HomePage />);

    expect(
      screen.getByText(/Share your expertise\. Teach on EduHub\./i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Start Teaching Today/i }),
    ).toBeInTheDocument();
  });

  it("renders role-aware secondary CTA button in Hero for Admin, Teacher, and Student", () => {
    // 1. Unauthenticated -> Get Started Free
    mockAuthUser = null;
    const { unmount: u1 } = render(<HomePage />);
    expect(screen.getByRole("link", { name: /Get Started Free/i })).toHaveAttribute("href", "/register");
    u1();

    // 2. Admin -> Admin Panel (/admin)
    mockAuthUser = { id: "a1", role: "ADMIN", fullName: "Admin User" };
    const { unmount: u2 } = render(<HomePage />);
    expect(screen.getByRole("link", { name: /Admin Panel/i })).toHaveAttribute("href", "/admin");
    u2();

    // 3. Teacher -> Teacher Dashboard (/teacher)
    mockAuthUser = { id: "t1", role: "TEACHER", fullName: "Teacher User" };
    const { unmount: u3 } = render(<HomePage />);
    expect(screen.getByRole("link", { name: /^Teacher Dashboard$/i })).toHaveAttribute("href", "/teacher");
    u3();

    // 4. Student -> My Learning Dashboard (/me/enrollments)
    mockAuthUser = { id: "s1", role: "STUDENT", fullName: "Student User" };
    const { unmount: u4 } = render(<HomePage />);
    expect(screen.getByRole("link", { name: /My Learning Dashboard/i })).toHaveAttribute("href", "/me/enrollments");
    u4();
  });
});
