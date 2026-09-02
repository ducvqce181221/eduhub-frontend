import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Header } from "@/components/layout/header";
import ProfilePage from "@/app/(student)/profile/page";
import ChangePasswordPage from "@/app/(student)/change-password/page";
import * as authContext from "@/lib/auth/auth-context";
import { apiClient } from "@/lib/api/client";
import type { User } from "@/types/api";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  usePathname: () => "/profile",
}));

describe("Slice 6: Frontend App Shell & Navigation & Profile / Change Password", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockReset();
  });

  describe("Header Navigation Component", () => {
    it("should render public sign-in and sign-up buttons when unauthenticated", () => {
      vi.spyOn(authContext, "useAuth").mockReturnValue({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        refreshSession: vi.fn(),
        updateUser: vi.fn(),
      });

      render(<Header />);
      expect(screen.getByText(/eduhub/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /get started/i })).toBeInTheDocument();
    });

    it("should render Teacher navigation links when authenticated as TEACHER", () => {
      const teacherUser: User = {
        id: "teacher-1",
        email: "teacher@eduhub.dev",
        fullName: "Professor Smith",
        role: "TEACHER",
        isActive: true,
      };

      vi.spyOn(authContext, "useAuth").mockReturnValue({
        user: teacherUser,
        accessToken: "token",
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        refreshSession: vi.fn(),
        updateUser: vi.fn(),
      });

      render(<Header />);
      expect(screen.getByRole("link", { name: /teacher dashboard/i })).toBeInTheDocument();
      expect(screen.getByText("Professor Smith")).toBeInTheDocument();
    });

    it("should render Admin navigation links when authenticated as ADMIN", () => {
      const adminUser: User = {
        id: "admin-1",
        email: "admin@eduhub.dev",
        fullName: "System Admin",
        role: "ADMIN",
        isActive: true,
      };

      vi.spyOn(authContext, "useAuth").mockReturnValue({
        user: adminUser,
        accessToken: "token",
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        refreshSession: vi.fn(),
        updateUser: vi.fn(),
      });

      render(<Header />);
      expect(screen.getByRole("link", { name: /admin panel/i })).toBeInTheDocument();
      expect(screen.getByText("System Admin")).toBeInTheDocument();
    });
  });

  describe("Profile Page (/profile)", () => {
    it("should render user details with read-only email and allow updating full name", async () => {
      const mockUser: User = {
        id: "student-1",
        email: "student@eduhub.dev",
        fullName: "Jane Doe",
        role: "STUDENT",
        isActive: true,
        avatarUrl: null,
      };

      const mockUpdateUser = vi.fn();
      vi.spyOn(authContext, "useAuth").mockReturnValue({
        user: mockUser,
        accessToken: "token",
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        refreshSession: vi.fn(),
        updateUser: mockUpdateUser,
      });

      vi.spyOn(apiClient, "patch").mockResolvedValue({
        success: true,
        data: { ...mockUser, fullName: "Jane Smith" },
      });

      render(<ProfilePage />);

      expect(screen.getByDisplayValue("Jane Doe")).toBeInTheDocument();
      const emailInput = screen.getByDisplayValue("student@eduhub.dev");
      expect(emailInput).toBeDisabled();

      fireEvent.change(screen.getByDisplayValue("Jane Doe"), {
        target: { value: "Jane Smith" },
      });

      fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

      await waitFor(() => {
        expect(apiClient.patch).toHaveBeenCalledWith("/auth/me", {
          body: { fullName: "Jane Smith" },
        });
        expect(mockUpdateUser).toHaveBeenCalledWith({ fullName: "Jane Smith" });
      });
    });
  });

  describe("Change Password Page (/change-password)", () => {
    it("should render change password form and submit to /auth/change-password", async () => {
      vi.spyOn(apiClient, "post").mockResolvedValue({
        success: true,
        data: { message: "Password changed successfully" },
      });

      render(<ChangePasswordPage />);

      fireEvent.change(screen.getByLabelText(/current password/i), {
        target: { value: "OldPassword123!" },
      });
      fireEvent.change(screen.getByLabelText(/^new password/i), {
        target: { value: "NewPassword123!" },
      });
      fireEvent.change(screen.getByLabelText(/confirm new password/i), {
        target: { value: "NewPassword123!" },
      });

      fireEvent.click(screen.getByRole("button", { name: /update password/i }));

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith("/auth/change-password", {
          body: {
            currentPassword: "OldPassword123!",
            newPassword: "NewPassword123!",
          },
        });
      });
    });
  });
});
