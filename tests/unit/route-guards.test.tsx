import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoleGuard } from "@/components/auth/role-guard";
import * as authContext from "@/lib/auth/auth-context";
import type { User } from "@/types/api";

// Mock next/navigation
const mockPush = vi.fn();
const mockPathname = "/test-protected";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
  usePathname: () => mockPathname,
}));

describe("Slice 4: Frontend Route Guards & Layouts", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockReset();
  });

  it("should render loading state while auth is initializing", () => {
    vi.spyOn(authContext, "useAuth").mockReturnValue({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      updateUser: vi.fn(),
    });

    render(
      <RoleGuard requireAuth>
        <div>Protected Content</div>
      </RoleGuard>,
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.getByTestId("auth-loading-state")).toBeInTheDocument();
  });

  it("should redirect unauthenticated user to login when requireAuth is true", () => {
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

    render(
      <RoleGuard requireAuth>
        <div>Protected Content</div>
      </RoleGuard>,
    );

    expect(mockPush).toHaveBeenCalledWith("/login?returnUrl=%2Ftest-protected");
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should render 403 Not Authorized component when user role is not permitted", () => {
    const studentUser: User = {
      id: "student-1",
      email: "student@eduhub.dev",
      fullName: "Student User",
      role: "STUDENT",
      isActive: true,
    };

    vi.spyOn(authContext, "useAuth").mockReturnValue({
      user: studentUser,
      accessToken: "token",
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      updateUser: vi.fn(),
    });

    render(
      <RoleGuard requireAuth allowedRoles={["TEACHER", "ADMIN"]}>
        <div>Teacher Dashboard</div>
      </RoleGuard>,
    );

    expect(screen.queryByText("Teacher Dashboard")).not.toBeInTheDocument();
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });

  it("should render children when user has matching allowed role", () => {
    const teacherUser: User = {
      id: "teacher-1",
      email: "teacher@eduhub.dev",
      fullName: "Teacher User",
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

    render(
      <RoleGuard requireAuth allowedRoles={["TEACHER", "ADMIN"]}>
        <div>Teacher Dashboard</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Teacher Dashboard")).toBeInTheDocument();
  });

  it("should redirect authenticated user away from guest-only routes", () => {
    const studentUser: User = {
      id: "student-1",
      email: "student@eduhub.dev",
      fullName: "Student User",
      role: "STUDENT",
      isActive: true,
    };

    vi.spyOn(authContext, "useAuth").mockReturnValue({
      user: studentUser,
      accessToken: "token",
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      updateUser: vi.fn(),
    });

    render(
      <RoleGuard guestOnly>
        <div>Login Page Content</div>
      </RoleGuard>,
    );

    expect(mockPush).toHaveBeenCalledWith("/");
    expect(screen.queryByText("Login Page Content")).not.toBeInTheDocument();
  });
});
