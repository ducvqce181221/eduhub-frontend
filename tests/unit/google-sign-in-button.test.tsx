import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

describe("Phase 12 - GoogleSignInButton Component (TDD: Red)", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.restoreAllMocks();
    delete (window as any).location;
    window.location = { ...originalLocation, href: "", assign: vi.fn() } as any;
  });

  it("should render Google sign-in button with Notion styling and Google icon", () => {
    render(<GoogleSignInButton mode="signin" />);

    const button = screen.getByRole("button", { name: /sign in with google/i });
    expect(button).toBeInTheDocument();
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("should render 'Sign up with Google' when mode is signup", () => {
    render(<GoogleSignInButton mode="signup" />);

    expect(
      screen.getByRole("button", { name: /sign up with google/i }),
    ).toBeInTheDocument();
  });

  it("should redirect user to backend Google OAuth endpoint when clicked", () => {
    render(<GoogleSignInButton mode="signin" returnUrl="/courses/intro-to-nest" />);

    const button = screen.getByRole("button", { name: /sign in with google/i });
    fireEvent.click(button);

    expect(window.location.href).toContain("/auth/google");
    expect(window.location.href).toContain("returnUrl=%2Fcourses%2Fintro-to-nest");
  });

  it("should display loading state and disable button when clicked", () => {
    render(<GoogleSignInButton mode="signin" />);

    const button = screen.getByRole("button", { name: /sign in with google/i });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(screen.getByText(/connecting to google/i)).toBeInTheDocument();
  });

  it("should reset loading state when window receives pageshow event (bfcache navigation)", () => {
    render(<GoogleSignInButton mode="signin" />);

    const button = screen.getByRole("button", { name: /sign in with google/i });
    fireEvent.click(button);

    expect(screen.getByText(/connecting to google/i)).toBeInTheDocument();

    // Trigger pageshow event
    fireEvent(window, new Event("pageshow"));

    expect(button).not.toBeDisabled();
    expect(screen.getByText(/sign in with google/i)).toBeInTheDocument();
  });
});
