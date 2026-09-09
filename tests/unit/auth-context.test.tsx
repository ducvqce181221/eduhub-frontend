import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/lib/auth/auth-context";
import { apiClient } from "@/lib/api/client";
import type { User } from "@/types/api";

const mockUser: User = {
  id: "uuid-student-1",
  email: "student@eduhub.dev",
  fullName: "Test Learner",
  role: "STUDENT",
  isActive: true,
  avatarUrl: null,
};

describe("Slice 3: Frontend Auth Context & Token Lifecycle", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should bootstrap session on mount by calling refresh and getProfile", async () => {
    vi.spyOn(apiClient, "post").mockImplementation(async (endpoint) => {
      if (endpoint === "/auth/refresh") {
        return { success: true, data: { accessToken: "new-token" } };
      }
      return { success: false, data: null };
    });

    vi.spyOn(apiClient, "get").mockImplementation(async (endpoint) => {
      if (endpoint === "/auth/me") {
        return { success: true, data: mockUser };
      }
      return { success: false, data: null };
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it("should set unauthenticated when initial refresh fails", async () => {
    vi.spyOn(apiClient, "post").mockRejectedValue(new Error("Unauthorized"));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("should successfully authenticate user on login()", async () => {
    vi.spyOn(apiClient, "post").mockImplementation(async (endpoint) => {
      if (endpoint === "/auth/refresh") {
        throw new Error("No session");
      }
      if (endpoint === "/auth/login") {
        return {
          success: true,
          data: { accessToken: "login-access-token", user: mockUser },
        };
      }
      return { success: false, data: null };
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login({ email: "student@eduhub.dev", password: "Password123!" });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it("should clear session and user on logout()", async () => {
    vi.spyOn(apiClient, "post").mockImplementation(async (endpoint) => {
      if (endpoint === "/auth/refresh") {
        return { success: true, data: { accessToken: "new-token" } };
      }
      if (endpoint === "/auth/logout") {
        return { success: true, data: { message: "Logged out" } };
      }
      return { success: false, data: null };
    });

    vi.spyOn(apiClient, "get").mockResolvedValue({ success: true, data: mockUser });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
