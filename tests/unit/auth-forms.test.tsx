import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/(public)/login/page";
import RegisterPage from "@/app/(public)/register/page";
import ForgotPasswordPage from "@/app/(public)/forgot-password/page";
import ResetPasswordPage from "@/app/(public)/reset-password/page";
import * as authContext from "@/lib/auth/auth-context";
import { apiClient } from "@/lib/api/client";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  useSearchParams: () => ({
    get: (key: string) => (key === "token" ? "valid-reset-token" : null),
  }),
  usePathname: () => "/login",
}));

describe("Slice 5: Frontend Auth Forms", () => {
  const mockLogin = vi.fn();
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockReset();
    mockLogin.mockReset();
    mockRegister.mockReset();

    vi.spyOn(authContext, "useAuth").mockReturnValue({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      register: mockRegister,
      logout: vi.fn(),
      refreshSession: vi.fn(),
      updateUser: vi.fn(),
      loginWithGoogle: vi.fn(),
    });
  });

  describe("Login Form (/login)", () => {
    it("should render email and password inputs and submit button", () => {
      render(<LoginPage />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^sign in$/i })).toBeInTheDocument();
    });

    it("should show validation errors when submitted with empty fields", async () => {
      render(<LoginPage />);
      fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it("should call auth.login and redirect on successful submission", async () => {
      mockLogin.mockResolvedValue({ accessToken: "token", user: { id: "1" } });
      render(<LoginPage />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "student@eduhub.dev" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "Password123!" },
      });

      fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: "student@eduhub.dev",
          password: "Password123!",
        });
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });

    it("should redirect ADMIN to /admin on successful login without returnUrl", async () => {
      mockLogin.mockResolvedValue({ accessToken: "token", user: { id: "admin-1", role: "ADMIN" } });
      render(<LoginPage />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "admin@eduhub.dev" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "Password123!" },
      });

      fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/admin");
      });
    });
  });

  describe("Register Form (/register)", () => {
    it("should render student registration form without role selector [BR-USR-01]", () => {
      render(<RegisterPage />);
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/role/i)).not.toBeInTheDocument();
    });

    it("should show validation error when password is weak or passwords do not match", async () => {
      render(<RegisterPage />);

      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "john@eduhub.dev" },
      });
      fireEvent.change(screen.getByLabelText(/^password/i), {
        target: { value: "weak" },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: "mismatch" },
      });

      fireEvent.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe("Forgot Password Form (/forgot-password)", () => {
    it("should render forgot password form and call endpoint", async () => {
      vi.spyOn(apiClient, "post").mockResolvedValue({
        success: true,
        data: { message: "Reset email sent" },
      });

      render(<ForgotPasswordPage />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "student@eduhub.dev" },
      });

      fireEvent.click(screen.getByRole("button", { name: /send reset instructions/i }));

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith("/auth/forgot-password", {
          body: { email: "student@eduhub.dev" },
          skipAuth: true,
        });
      });
    });
  });

  describe("Reset Password Form (/reset-password)", () => {
    it("should submit new password with token from query params", async () => {
      vi.spyOn(apiClient, "post").mockResolvedValue({
        success: true,
        data: { message: "Password reset successful" },
      });

      render(<ResetPasswordPage />);

      fireEvent.change(screen.getByLabelText(/^new password/i), {
        target: { value: "NewPassword123!" },
      });
      fireEvent.change(screen.getByLabelText(/confirm new password/i), {
        target: { value: "NewPassword123!" },
      });

      fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith("/auth/reset-password", {
          body: {
            token: "valid-reset-token",
            newPassword: "NewPassword123!",
          },
          skipAuth: true,
        });
      });
    });
  });
});
