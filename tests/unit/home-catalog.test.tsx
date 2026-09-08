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

vi.mock("@/hooks/use-banners", () => ({
  useActiveBannersQuery: () => ({
    data: [
      {
        id: "banner-1",
        title: "Master Modern Software Engineering",
        imageUrl: "https://example.com/banner1.jpg",
        linkUrl: "#catalog",
        order: 1,
        isActive: true,
      },
    ],
    isLoading: false,
  }),
}));

describe("HomePage (Unified Catalog with Banner Carousel & FAQ)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Promo Banner Carousel section", () => {
    render(<HomePage />);

    expect(
      screen.getByLabelText(/Promotional Banners/i),
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

  it("renders Practical Knowledge FAQ section", () => {
    render(<HomePage />);

    expect(
      screen.getByText(/Frequently Asked Questions/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Everything you need to know about learning and teaching on EduHub\./i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/How does self-paced learning work on EduHub\?/i),
    ).toBeInTheDocument();
  });
});

