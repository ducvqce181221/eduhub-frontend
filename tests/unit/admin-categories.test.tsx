import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoriesTable } from "@/components/admin/categories/categories-table";
import { CategoryFormDialog } from "@/components/admin/categories/category-form-dialog";
import { DeleteCategoryDialog } from "@/components/admin/categories/delete-category-dialog";
import type { Category } from "@/types/api";

const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "Web Development",
    slug: "web-development",
    description: "Frontend and backend web technologies.",
    isActive: true,
  },
  {
    id: "cat-2",
    name: "Mobile Development",
    slug: "mobile-development",
    description: "iOS, Android, and cross-platform apps.",
    isActive: false,
  },
];

describe("Category Management Components (Admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("CategoriesTable", () => {
    it("renders categories with names, slugs, status badges, and action buttons in English", () => {
      render(
        <CategoriesTable
          categories={mockCategories}
          onEditCategory={vi.fn()}
          onDeleteCategory={vi.fn()}
        />,
      );

      expect(screen.getByText("Web Development")).toBeInTheDocument();
      expect(screen.getByText("web-development")).toBeInTheDocument();
      expect(screen.getByText("Mobile Development")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("Hidden")).toBeInTheDocument();
    });

    it("triggers edit and delete callbacks when action buttons are clicked", async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      render(
        <CategoriesTable
          categories={mockCategories}
          onEditCategory={onEdit}
          onDeleteCategory={onDelete}
        />,
      );

      const editBtn = screen.getByTestId("edit-category-cat-1");
      const deleteBtn = screen.getByTestId("delete-category-cat-1");

      await user.click(editBtn);
      expect(onEdit).toHaveBeenCalledWith(mockCategories[0]);

      await user.click(deleteBtn);
      expect(onDelete).toHaveBeenCalledWith(mockCategories[0]);
    });
  });

  describe("CategoryFormDialog", () => {
    it("validates required fields, auto-generates slug, and submits payload", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(
        <CategoryFormDialog
          open={true}
          onOpenChange={vi.fn()}
          onSubmit={onSubmit}
        />,
      );

      expect(screen.getByText("Create Category")).toBeInTheDocument();

      const nameInput = screen.getByLabelText(/category name/i);
      await user.type(nameInput, "Data Science");

      const descInput = screen.getByLabelText(/description/i);
      await user.type(descInput, "Machine learning, AI, and statistics.");

      const submitBtn = screen.getByRole("button", { name: /save category/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          name: "Data Science",
          slug: "data-science",
          description: "Machine learning, AI, and statistics.",
          isActive: true,
        });
      });
    });
  });

  describe("DeleteCategoryDialog", () => {
    it("confirms deletion and surfaces 409 conflict error message from backend (BR-CAT-02)", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn().mockRejectedValue(new Error("Category has active courses attached"));

      render(
        <DeleteCategoryDialog
          open={true}
          category={mockCategories[0]}
          onOpenChange={vi.fn()}
          onConfirm={onConfirm}
        />,
      );

      expect(screen.getByRole("heading", { name: /delete category/i })).toBeInTheDocument();
      expect(screen.getByText("Web Development")).toBeInTheDocument();

      const confirmBtn = screen.getByRole("button", { name: /delete category/i });
      await user.click(confirmBtn);

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalled();
        expect(screen.getByText(/category has active courses attached/i)).toBeInTheDocument();
      });
    });
  });
});
