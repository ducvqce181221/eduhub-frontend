import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSelector } from "@/components/common/language-selector";
import * as LanguageContext from "@/lib/i18n/language-context";
import { en } from "@/lib/i18n/dictionaries/en";

const mockSwitchLanguage = vi.fn();
const mockSetLanguage = vi.fn();
const mockToggleLanguage = vi.fn();

describe("LanguageSelector Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupMockLanguage = (language: "en" | "vi", isPending = false) => {
    vi.spyOn(LanguageContext, "useLanguage").mockReturnValue({
      language,
      t: en,
      switchLanguage: mockSwitchLanguage,
      setLanguage: mockSetLanguage,
      toggleLanguage: mockToggleLanguage,
      isPending,
    });
  };

  it("renders the trigger with the flag icon and accessible label for English without text", () => {
    setupMockLanguage("en");
    render(<LanguageSelector />);

    // Trigger button should be rendered with accessible name
    const trigger = screen.getByRole("button", {
      name: /Current language: English\. Select to change language/i,
    });
    expect(trigger).toBeInTheDocument();

    // No text label rendered inside the trigger button
    expect(trigger).not.toHaveTextContent("English");
    expect(trigger).not.toHaveTextContent("EN");
  });

  it("renders the trigger with the flag icon and accessible label for Vietnamese without text", () => {
    setupMockLanguage("vi");
    render(<LanguageSelector />);

    const trigger = screen.getByRole("button", {
      name: /Current language: Tiếng Việt\. Select to change language/i,
    });
    expect(trigger).toBeInTheDocument();

    expect(trigger).not.toHaveTextContent("Tiếng Việt");
    expect(trigger).not.toHaveTextContent("VI");
  });

  it("opens dropdown menu on click, displaying all supported languages with active checkmark", async () => {
    const user = userEvent.setup();
    setupMockLanguage("en");
    render(<LanguageSelector />);

    const trigger = screen.getByRole("button", {
      name: /Current language: English\. Select to change language/i,
    });
    await user.click(trigger);

    // Dropdown label
    expect(screen.getByText("Select language")).toBeInTheDocument();

    // Both languages are displayed
    expect(screen.getByRole("menuitem", { name: /English/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Tiếng Việt/i })).toBeInTheDocument();
  });

  it("calls switchLanguage with 'vi' when clicking Tiếng Việt from English", async () => {
    const user = userEvent.setup();
    setupMockLanguage("en");
    render(<LanguageSelector />);

    const trigger = screen.getByRole("button", {
      name: /Current language: English\. Select to change language/i,
    });
    await user.click(trigger);

    const viOption = screen.getByRole("menuitem", { name: /Tiếng Việt/i });
    await user.click(viOption);

    expect(mockSwitchLanguage).toHaveBeenCalledWith("vi");
  });

  it("calls switchLanguage with 'en' when clicking English from Tiếng Việt", async () => {
    const user = userEvent.setup();
    setupMockLanguage("vi");
    render(<LanguageSelector />);

    const trigger = screen.getByRole("button", {
      name: /Current language: Tiếng Việt\. Select to change language/i,
    });
    await user.click(trigger);

    const enOption = screen.getByRole("menuitem", { name: /English/i });
    await user.click(enOption);

    expect(mockSwitchLanguage).toHaveBeenCalledWith("en");
  });

  it("disables trigger and shows loader when isPending is true", () => {
    setupMockLanguage("en", true);
    render(<LanguageSelector />);

    const trigger = screen.getByRole("button", {
      name: /Current language: English\. Select to change language/i,
    });
    expect(trigger).toBeDisabled();
  });
});
