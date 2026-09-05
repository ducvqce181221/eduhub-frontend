import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/lib/auth/auth-context";
import { apiClient } from "@/lib/api/client";
import type { User, AuthResponse } from "@/types/api";

const mockGoogleUser: User = {
  id: "uuid-google-student",
  email: "google.student@eduhub.dev",
  fullName: "Google Student",
  role: "STUDENT",
  isActive: true,
  avatarUrl: "https://lh3.googleusercontent.com/avatar.jpg",
};

describe("Phase 12 - AuthContext loginWithGoogle (TDD: Red)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should authenticate via loginWithGoogle and update auth state", async () => {
    vi.spyOn(apiClient, "post").mockImplementation(async (endpoint, options: any) => {
      if (endpoint === "/auth/refresh") {
        throw new Error("No initial token");
      }
      if (endpoint === "/auth/google") {
        return {
          success: true,
          data: {
            accessToken: "mock-google-jwt-access-token",
            refreshToken: "mock-google-jwt-refresh-token",
            user: mockGoogleUser,
          } as AuthResponse,
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
      const authData = await result.current.loginWithGoogle({
        googleId: "google-uid-12345",
        email: "google.student@eduhub.dev",
        fullName: "Google Student",
      });
      expect(authData.user.email).toBe("google.student@eduhub.dev");
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockGoogleUser);
    expect(result.current.accessToken).toBe("mock-google-jwt-access-token");
  });
});
