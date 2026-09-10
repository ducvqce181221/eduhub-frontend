import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NotFound from "@/app/[locale]/not-found";
import { NotAuthorized } from "@/components/common/not-authorized";
import AboutPage from "@/app/[locale]/(public)/about/page";
import * as LanguageContext from "@/lib/i18n/language-context";
import { vi as viDict } from "@/lib/i18n/dictionaries/vi";

const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/en/404",
  useSearchParams: () => new URLSearchParams(),
}));

describe("Error Pages (Flowbase Noda-inspired Split Layout)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockBack.mockClear();
  });

  it("renders 404 page with large typographic 404 and clean recovery actions in English", () => {
    render(<NotFound />);

    // Huge typographic 404 code
    expect(screen.getByText("404")).toBeInTheDocument();

    // Headline & description
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
    expect(
      screen.getByText(/This page couldn’t be found/i),
    ).toBeInTheDocument();

    // Recovery buttons
    const homeLink = screen.getByRole("link", { name: /Back to Home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/en");

    // Go back button
    const backBtn = screen.getByRole("button", { name: /Go Back/i });
    expect(backBtn).toBeInTheDocument();
    fireEvent.click(backBtn);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("renders 404 page in Vietnamese when language is 'vi'", () => {
    const spy = vi.spyOn(LanguageContext, "useTranslation").mockReturnValue({
      language: "vi",
      t: viDict,
      switchLanguage: vi.fn(),
      setLanguage: vi.fn(),
      toggleLanguage: vi.fn(),
      isPending: false,
    });

    render(<NotFound />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Trang không tồn tại")).toBeInTheDocument();
    expect(
      screen.getByText(/Trang bạn đang tìm kiếm có thể đã bị di chuyển/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Về trang chủ/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Quay lại/i })).toBeInTheDocument();

    spy.mockRestore();
  });

  it("renders 403 NotAuthorized page with unified 403 split layout", () => {
    render(<NotAuthorized />);

    expect(screen.getByText("403")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Access Denied" })).toBeInTheDocument();
    expect(screen.queryByText(/\(403\)/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Return to Home/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Go Back/i })).toBeInTheDocument();
  });
});

describe("AboutPage Component (Anti-Slop Editorial)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders editorial narrative, values, and courses CTA in English", () => {
    render(<AboutPage />);

    expect(
      screen.getByText("Learning should feel focused, not noisy."),
    ).toBeInTheDocument();
    expect(screen.getByText("What we stand for")).toBeInTheDocument();
    expect(screen.getByText("Calm by design")).toBeInTheDocument();
    expect(screen.getByText("Instructor ownership")).toBeInTheDocument();
    expect(screen.getByText("Data dignity")).toBeInTheDocument();

    const ctaLink = screen.getByRole("link", { name: /Browse catalog/i });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute("href", "/en/courses");
  });

  it("renders editorial narrative in Vietnamese", () => {
    const spy = vi.spyOn(LanguageContext, "useTranslation").mockReturnValue({
      language: "vi",
      t: viDict,
      switchLanguage: vi.fn(),
      setLanguage: vi.fn(),
      toggleLanguage: vi.fn(),
      isPending: false,
    });

    render(<AboutPage />);

    expect(
      screen.getByText("Học tập cần sự tĩnh tại, không phải tiếng ồn."),
    ).toBeInTheDocument();
    expect(screen.getByText("Nguyên tắc cốt lõi")).toBeInTheDocument();
    expect(screen.getByText("Tĩnh tại trong từng điểm chạm")).toBeInTheDocument();
    expect(screen.getByText("Tôn trọng quyền tác giả")).toBeInTheDocument();
    expect(screen.getByText("Minh bạch và riêng tư")).toBeInTheDocument();

    const ctaLink = screen.getByRole("link", { name: /Khám phá danh mục khóa học/i });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute("href", "/en/courses");

    spy.mockRestore();
  });
});
