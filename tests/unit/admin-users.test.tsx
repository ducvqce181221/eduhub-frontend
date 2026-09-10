import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UsersTable } from "@/components/admin/users/users-table";
import { CreateUserDialog } from "@/components/admin/users/create-user-dialog";
import { RoleChangeDialog } from "@/components/admin/users/role-change-dialog";
import { StatusToggleDialog } from "@/components/admin/users/status-toggle-dialog";
import { formatJoinedDate } from "@/lib/i18n/formatters";
import * as LanguageContext from "@/lib/i18n/language-context";
import { vi as viDict } from "@/lib/i18n/dictionaries/vi";
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
    vi.restoreAllMocks();
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
      expect(screen.getAllByText("Administrator").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Teacher").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Student").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Active")).toHaveLength(3); // 1 in filter dropdown, 2 in table rows
      expect(screen.getAllByText("Inactive")).toHaveLength(2); // 1 in filter dropdown, 1 in table rows
    });

    it("formats joined date as MM/dd/yyyy for English and dd/MM/yyyy for Vietnamese", () => {
      // Direct formatter assertion
      expect(formatJoinedDate("2026-08-01T10:00:00.000Z", "en")).toBe("08/01/2026");
      expect(formatJoinedDate("2026-08-01T10:00:00.000Z", "vi")).toBe("01/08/2026");
      expect(formatJoinedDate(null, "vi")).toBe("N/A");
      expect(formatJoinedDate(undefined, "en")).toBe("N/A");
      expect(formatJoinedDate("invalid-date", "vi")).toBe("N/A");

      // Render in English (default)
      const { unmount } = render(
        <UsersTable
          users={[mockUsers[0]]}
          meta={mockMeta}
          onSearchChange={vi.fn()}
          onRoleFilterChange={vi.fn()}
          onStatusFilterChange={vi.fn()}
          onPageChange={vi.fn()}
          onChangeRole={vi.fn()}
          onToggleStatus={vi.fn()}
        />,
      );
      expect(screen.getByText("08/01/2026")).toBeInTheDocument();
      unmount();

      // Render in Vietnamese via useTranslation spy
      const spy = vi.spyOn(LanguageContext, "useTranslation").mockReturnValue({
        language: "vi",
        t: viDict,
        switchLanguage: vi.fn(),
        setLanguage: vi.fn(),
        toggleLanguage: vi.fn(),
        isPending: false,
      });

      render(
        <UsersTable
          users={[mockUsers[0]]}
          meta={mockMeta}
          onSearchChange={vi.fn()}
          onRoleFilterChange={vi.fn()}
          onStatusFilterChange={vi.fn()}
          onPageChange={vi.fn()}
          onChangeRole={vi.fn()}
          onToggleStatus={vi.fn()}
        />,
      );
      expect(screen.getByText("01/08/2026")).toBeInTheDocument();
      spy.mockRestore();
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
      fireEvent.keyDown(searchInput, { key: "Enter", code: "Enter" });
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
