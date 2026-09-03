import { describe, it, expect, vi } from "vitest";
import CoursesPageRedirect from "@/app/(public)/courses/page";
import { redirect } from "next/navigation";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("CoursesPageRedirect", () => {
  it("redirects /courses to /", () => {
    CoursesPageRedirect();
    expect(redirect).toHaveBeenCalledWith("/");
  });
});
