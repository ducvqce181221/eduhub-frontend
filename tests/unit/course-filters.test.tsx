import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CourseFilters } from "@/components/courses/course-filters";
import type { Category } from "@/types/api";

const mockCategories: Category[] = [
  { id: "cat-1", name: "Backend Development", slug: "backend", isActive: true },
  { id: "cat-2", name: "Frontend & UI", slug: "frontend", isActive: true },
  { id: "cat-3", name: "DevOps & Cloud", slug: "devops", isActive: true },
];

describe("CourseFilters Component", () => {
  it("renders search input, category filters, and level selectors", () => {
    render(
      <CourseFilters
        categories={mockCategories}
        selectedCategory=""
        selectedLevel=""
        searchValue=""
        onSearchChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onLevelChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByPlaceholderText(/search courses/i)).toBeInTheDocument();
    expect(screen.getByText("All Categories")).toBeInTheDocument();
    expect(screen.getByText("Backend Development")).toBeInTheDocument();
    expect(screen.getByText("Frontend & UI")).toBeInTheDocument();
    expect(screen.getByText("All Levels")).toBeInTheDocument();
  });

  it("calls onSearchChange when user types in search input", async () => {
    const user = userEvent.setup();
    const handleSearchChange = vi.fn();

    render(
      <CourseFilters
        categories={mockCategories}
        selectedCategory=""
        selectedLevel=""
        searchValue=""
        onSearchChange={handleSearchChange}
        onCategoryChange={vi.fn()}
        onLevelChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText(/search courses/i);
    await user.type(input, "NestJS");

    expect(handleSearchChange).toHaveBeenCalled();
  });

  it("calls onCategoryChange when user selects a category", async () => {
    const user = userEvent.setup();
    const handleCategoryChange = vi.fn();

    render(
      <CourseFilters
        categories={mockCategories}
        selectedCategory=""
        selectedLevel=""
        searchValue=""
        onSearchChange={vi.fn()}
        onCategoryChange={handleCategoryChange}
        onLevelChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    const backendBtn = screen.getByRole("button", { name: /Backend Development/i });
    await user.click(backendBtn);

    expect(handleCategoryChange).toHaveBeenCalledWith("cat-1");
  });

  it("calls onLevelChange when user selects a level", async () => {
    const user = userEvent.setup();
    const handleLevelChange = vi.fn();

    render(
      <CourseFilters
        categories={mockCategories}
        selectedCategory=""
        selectedLevel=""
        searchValue=""
        onSearchChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onLevelChange={handleLevelChange}
        onReset={vi.fn()}
      />,
    );

    const beginnerBtn = screen.getByRole("button", { name: /Beginner/i });
    await user.click(beginnerBtn);

    expect(handleLevelChange).toHaveBeenCalledWith("BEGINNER");
  });

  it("shows reset button when filters are active and triggers onReset when clicked", async () => {
    const user = userEvent.setup();
    const handleReset = vi.fn();

    render(
      <CourseFilters
        categories={mockCategories}
        selectedCategory="cat-1"
        selectedLevel="INTERMEDIATE"
        searchValue="Microservices"
        onSearchChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onLevelChange={vi.fn()}
        onReset={handleReset}
      />,
    );

    const resetBtn = screen.getByRole("button", { name: /Reset filters/i });
    expect(resetBtn).toBeInTheDocument();

    await user.click(resetBtn);
    expect(handleReset).toHaveBeenCalled();
  });
});
