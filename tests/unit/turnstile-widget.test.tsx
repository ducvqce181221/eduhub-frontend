import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TurnstileWidget } from "@/components/common/turnstile-widget";

describe("TurnstileWidget Component", () => {
  const mockOnVerify = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders container element and placeholder text", () => {
    const { container } = render(<TurnstileWidget onVerify={mockOnVerify} />);

    expect(container.querySelector(".cf-turnstile-container")).toBeInTheDocument();
    expect(screen.getByText(/Secured by Cloudflare Turnstile/i)).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    const { container } = render(
      <TurnstileWidget onVerify={mockOnVerify} className="custom-test-class" />
    );

    expect(container.querySelector(".custom-test-class")).toBeInTheDocument();
  });

  it("accepts action and resetSignal props without errors", () => {
    const { container, rerender } = render(
      <TurnstileWidget action="signup" resetSignal={0} onVerify={mockOnVerify} />
    );

    expect(container.querySelector(".cf-turnstile-container")).toBeInTheDocument();

    rerender(
      <TurnstileWidget action="signup" resetSignal={1} onVerify={mockOnVerify} />
    );
    expect(container.querySelector(".cf-turnstile-container")).toBeInTheDocument();
  });
});

