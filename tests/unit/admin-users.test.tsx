import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UsersTable } from "@/components/admin/users/users-table";
import { CreateUserDialog } from "@/components/admin/users/create-user-dialog";
import { RoleChangeDialog } from "@/components/admin/users/role-change-dialog";
import { StatusToggleDialog } from "@/components/admin/users/status-toggle-dialog";
import type { User, PaginationMeta } from "@/types/api";

const mockUsers: User[] = [
  {
    id: "admin-1",
    email: "admin@eduhub.dev",
    fullName: "Super Admin",
    role: "ADMIN",
    isActive: true,
    createdAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "teacher-1",
    email: "teacher@eduhub.dev",
    fullName: "John Professor",
    role: "TEACHER",
    isActive: true,
    createdAt: "2026-08-05T12:00:00.000Z",
  },
  {
    id: "student-1",
    email: "student@eduhub.dev",
    fullName: "Alice Learner",
    role: "STUDENT",
    isActive: false,
    createdAt: "2026-08-10T14:00:00.000Z",
  },
];

const mockMeta: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 3,
  totalPages: 1,
};

describe("User Management Components (Admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("UsersTable", () => {
    it("renders user rows with details, role badges, and status indicators", () => {
      render(
        <UsersTable
          users={mockUsers}
          meta={mockMeta}
          currentAdminId="admin-1"
          onSearchChange={vi.fn()}
          onRoleFilterChange={vi.fn()}
          onStatusFilterChange={vi.fn()}
          onPageChange={vi.fn()}
          onChangeRole={vi.fn()}
          onToggleStatus={vi.fn()}
        />,
      );

      expect(screen.getByText("Super Admin")).toBeInTheDocument();
      expect(screen.getByText("admin@eduhub.dev")).toBeInTheDocument();
      expect(screen.getByText("John Professor")).toBeInTheDocument();
      expect(screen.getByText("teacher@eduhub.dev")).toBeInTheDocument();
      expect(screen.getByText("Alice Learner")).toBeInTheDocument();

      // Badges
      expect(screen.getByText("ADMIN")).toBeInTheDocument();
      expect(screen.getByText("TEACHER")).toBeInTheDocument();
      expect(screen.getByText("STUDENT")).toBeInTheDocument();
      expect(screen.getAllByText("Active")).toHaveLength(3); // 1 in filter dropdown, 2 in table rows
      expect(screen.getAllByText("Inactive")).toHaveLength(2); // 1 in filter dropdown, 1 in table rows
    });

    it("disables deactivate action on current administrator account (BR-USR-03)", () => {
      render(
        <UsersTable
          users={mockUsers}
          meta={mockMeta}
          currentAdminId="admin-1"
          onSearchChange={vi.fn()}
          onRoleFilterChange={vi.fn()}
          onStatusFilterChange={vi.fn()}
          onPageChange={vi.fn()}
          onChangeRole={vi.fn()}
          onToggleStatus={vi.fn()}
        />,
      );

      // Current admin status button should be disabled or marked as protected
      const adminDeactivateBtn = screen.getByTestId("toggle-status-admin-1");
      expect(adminDeactivateBtn).toBeDisabled();
      expect(adminDeactivateBtn).toHaveAttribute("title", "You cannot deactivate your own account");

      // Non-admin user can be toggled
      const teacherDeactivateBtn = screen.getByTestId("toggle-status-teacher-1");
      expect(teacherDeactivateBtn).not.toBeDisabled();
    });

    it("triggers search and filter change callbacks", async () => {
      const onSearchChange = vi.fn();
      const onRoleFilterChange = vi.fn();
      const onStatusFilterChange = vi.fn();

      render(
        <UsersTable
          users={mockUsers}
          meta={mockMeta}
          currentAdminId="admin-1"
          onSearchChange={onSearchChange}
          onRoleFilterChange={onRoleFilterChange}
          onStatusFilterChange={onStatusFilterChange}
          onPageChange={vi.fn()}
          onChangeRole={vi.fn()}
          onToggleStatus={vi.fn()}
        />,
      );

      const searchInput = screen.getByPlaceholderText(/search by name or email/i);
      fireEvent.change(searchInput, { target: { value: "john" } });
      expect(onSearchChange).toHaveBeenCalledWith("john");
    });
  });

  describe("CreateUserDialog", () => {
    it("validates fields and submits new user data in English", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(
        <CreateUserDialog
          open={true}
          onOpenChange={vi.fn()}
          onSubmit={onSubmit}
        />,
      );

      expect(screen.getByText("Create New Account")).toBeInTheDocument();

      await user.type(screen.getByLabelText(/full name/i), "Jane Educator");
      await user.type(screen.getByLabelText(/email address/i), "jane.educator@eduhub.dev");
      await user.type(screen.getByLabelText(/password/i), "Password123!");

      const submitButton = screen.getByRole("button", { name: /create user/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          fullName: "Jane Educator",
          email: "jane.educator@eduhub.dev",
          password: "Password123!",
          role: "TEACHER",
        });
      });
    });
  });

  describe("RoleChangeDialog", () => {
    it("displays user info and submits role modification", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      render(
        <RoleChangeDialog
          open={true}
          user={mockUsers[1]} // John Professor
          onOpenChange={vi.fn()}
          onConfirm={onConfirm}
        />,
      );

      expect(screen.getByText(/change role for/i)).toBeInTheDocument();
      expect(screen.getByText(/John Professor/i)).toBeInTheDocument();

      const confirmButton = screen.getByRole("button", { name: /update role/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalled();
      });
    });
  });

  describe("StatusToggleDialog", () => {
    it("displays confirmation message and warning before toggling account status", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      render(
        <StatusToggleDialog
          open={true}
          user={mockUsers[1]} // Active teacher
          onOpenChange={vi.fn()}
          onConfirm={onConfirm}
        />,
      );

      expect(screen.getByText(/deactivate account/i)).toBeInTheDocument();
      expect(screen.getByText(/are you sure you want to deactivate/i)).toBeInTheDocument();

      const confirmBtn = screen.getByRole("button", { name: /confirm deactivation/i });
      await user.click(confirmBtn);

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledWith(false);
      });
    });
  });
});
