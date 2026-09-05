import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AuthCallbackPage from "@/app/(public)/auth/callback/page";
import * as authContext from "@/lib/auth/auth-context";

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  useSearchParams: () => mockSearchParams,
}));

describe("Phase 12 - Auth Callback Page (TDD: Red)", () => {
  const mockRefreshSession = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockReset();
    mockRefreshSession.mockReset();
    mockSearchParams = new URLSearchParams();

    vi.spyOn(authContext, "useAuth").mockReturnValue({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshSession: mockRefreshSession,
      updateUser: vi.fn(),
      loginWithGoogle: vi.fn(),
    } as any);
  });

  it("should render loading state while completing authentication", () => {
    mockRefreshSession.mockReturnValue(new Promise(() => {})); // pending

    render(<AuthCallbackPage />);

    expect(screen.getByText(/authenticating with google/i)).toBeInTheDocument();
  });

  it("should refresh session and redirect to returnUrl on successful OAuth exchange", async () => {
    mockSearchParams.set("returnUrl", "/courses/advanced-react");
    mockRefreshSession.mockResolvedValue(true);

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(mockRefreshSession).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/courses/advanced-react");
    });
  });

  it("should redirect to /courses by default if no returnUrl is specified", async () => {
    mockRefreshSession.mockResolvedValue(true);

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(mockRefreshSession).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/courses");
    });
  });

  it("should handle error param and redirect to login with error messaging", async () => {
    mockSearchParams.set("error", "Account has been disabled");
    mockRefreshSession.mockResolvedValue(false);

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("/login?error="),
      );
    });
  });
});
