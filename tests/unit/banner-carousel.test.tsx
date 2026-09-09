import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BannerCarousel } from "@/components/home/banner-carousel";

const mockUseActiveBannersQuery = vi.fn();

vi.mock("@/hooks/use-banners", () => ({
  useActiveBannersQuery: () => mockUseActiveBannersQuery(),
}));

describe("BannerCarousel Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders fallback default slide when no banners exist in database", () => {
    mockUseActiveBannersQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<BannerCarousel />);

    expect(screen.getByText("Master Modern Software Engineering")).toBeInTheDocument();
    expect(screen.getByText("Explore Courses")).toBeInTheDocument();
  });

  it("renders promotional banner image and title when banners are present", () => {
    mockUseActiveBannersQuery.mockReturnValue({
      data: [
        {
          id: "b-1",
          title: "Fullstack Next.js Bootcamp 2026",
          imageUrl: "https://example.com/banner-bootcamp.png",
          linkUrl: "/courses/nextjs-bootcamp",
          order: 1,
          isActive: true,
        },
      ],
      isLoading: false,
    });

    render(<BannerCarousel />);

    const img = screen.getByAltText("Fullstack Next.js Bootcamp 2026");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/banner-bootcamp.png");
    expect(screen.getByRole("link")).toHaveAttribute("href", "/courses/nextjs-bootcamp");
  });

  it("renders navigation controls when multiple banners are loaded and allows cycling", () => {
    mockUseActiveBannersQuery.mockReturnValue({
      data: [
        {
          id: "b-1",
          title: "Slide 1",
          imageUrl: "https://example.com/slide1.png",
          linkUrl: "/courses/1",
          order: 1,
          isActive: true,
        },
        {
          id: "b-2",
          title: "Slide 2",
          imageUrl: "https://example.com/slide2.png",
          linkUrl: "/courses/2",
          order: 2,
          isActive: true,
        },
      ],
      isLoading: false,
    });

    render(<BannerCarousel />);

    expect(screen.getByAltText("Slide 1")).toBeInTheDocument();

    const nextButton = screen.getByLabelText("Next slide");
    fireEvent.click(nextButton);

    expect(screen.getByAltText("Slide 2")).toBeInTheDocument();

    const prevButton = screen.getByLabelText("Previous slide");
    fireEvent.click(prevButton);

    expect(screen.getByAltText("Slide 1")).toBeInTheDocument();
  });
});
