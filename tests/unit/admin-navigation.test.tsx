import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/users",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock AuthContext
const mockAdminUser = {
  id: "admin-1",
  email: "admin@eduhub.dev",
  fullName: "Admin Administrator",
  role: "ADMIN" as const,
  isActive: true,
};

vi.mock("@/lib/auth/auth-context", () => ({
  useAuth: () => ({
    user: mockAdminUser,
    isLoading: false,
    isAuthenticated: true,
  }),
}));

describe("Admin Navigation & Layout Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("AdminSidebar", () => {
    it("renders EduHub Admin branding and all core navigation links in English", () => {
      render(<AdminSidebar />);

      expect(screen.getByText("EduHub Admin")).toBeInTheDocument();
      expect(screen.getByText("Users")).toBeInTheDocument();
      expect(screen.getByText("Categories")).toBeInTheDocument();
      expect(screen.getByText("Course Oversight")).toBeInTheDocument();
      expect(screen.getByText("System Broadcast")).toBeInTheDocument();
      expect(screen.getByText("Back to App")).toBeInTheDocument();
    });

    it("displays current administrator details and role badge", () => {
      render(<AdminSidebar />);

      expect(screen.getByText("Admin Administrator")).toBeInTheDocument();
      expect(screen.getByText("admin@eduhub.dev")).toBeInTheDocument();
      expect(screen.getByText("ADMIN")).toBeInTheDocument();
    });

    it("highlights the currently active navigation item", () => {
      render(<AdminSidebar />);

      const usersLink = screen.getByRole("link", { name: /users/i });
      expect(usersLink).toHaveAttribute("href", "/admin/users");
      // Has active background class per Notion design
      expect(usersLink.className).toContain("bg-surface");
    });
  });

  describe("AdminHeader", () => {
    it("renders page title, breadcrumb hierarchy, and active status indicator", () => {
      render(<AdminHeader title="User Management" breadcrumb="Administration / Users" />);

      expect(screen.getByText("User Management")).toBeInTheDocument();
      expect(screen.getByText("Administration / Users")).toBeInTheDocument();
      expect(screen.getByText("System Operational")).toBeInTheDocument();
    });
  });
});
