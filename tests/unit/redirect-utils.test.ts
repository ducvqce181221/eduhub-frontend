import { describe, it, expect } from "vitest";
import {
  isRouteAllowedForRole,
  getDefaultLandingPage,
  getPostLoginRedirect,
} from "@/lib/auth/redirect-utils";

describe("redirect-utils", () => {
  describe("isRouteAllowedForRole", () => {
    it("allows ADMIN to access /admin routes, but denies TEACHER and STUDENT", () => {
      expect(isRouteAllowedForRole("/admin", "ADMIN")).toBe(true);
      expect(isRouteAllowedForRole("/admin/users", "ADMIN")).toBe(true);
      expect(isRouteAllowedForRole("/admin/categories", "ADMIN")).toBe(true);

      expect(isRouteAllowedForRole("/admin", "TEACHER")).toBe(false);
      expect(isRouteAllowedForRole("/admin/users", "TEACHER")).toBe(false);

      expect(isRouteAllowedForRole("/admin", "STUDENT")).toBe(false);
      expect(isRouteAllowedForRole("/admin/users", "STUDENT")).toBe(false);
    });

    it("allows TEACHER and ADMIN to access /teacher routes, but denies STUDENT", () => {
      expect(isRouteAllowedForRole("/teacher", "TEACHER")).toBe(true);
      expect(isRouteAllowedForRole("/teacher/courses", "TEACHER")).toBe(true);
      expect(isRouteAllowedForRole("/teacher", "ADMIN")).toBe(true);

      expect(isRouteAllowedForRole("/teacher", "STUDENT")).toBe(false);
      expect(isRouteAllowedForRole("/teacher/courses", "STUDENT")).toBe(false);
    });

    it("allows only STUDENT to access /me/enrollments, /enrollments, and /learn routes", () => {
      expect(isRouteAllowedForRole("/me/enrollments", "STUDENT")).toBe(true);
      expect(isRouteAllowedForRole("/enrollments", "STUDENT")).toBe(true);
      expect(isRouteAllowedForRole("/learn/slug/lesson-1", "STUDENT")).toBe(true);

      expect(isRouteAllowedForRole("/me/enrollments", "ADMIN")).toBe(false);
      expect(isRouteAllowedForRole("/me/enrollments", "TEACHER")).toBe(false);
      expect(isRouteAllowedForRole("/learn/slug/lesson-1", "TEACHER")).toBe(false);
      expect(isRouteAllowedForRole("/learn/slug/lesson-1", "ADMIN")).toBe(false);
    });

    it("allows all authenticated users to access common routes", () => {
      expect(isRouteAllowedForRole("/profile", "STUDENT")).toBe(true);
      expect(isRouteAllowedForRole("/profile", "TEACHER")).toBe(true);
      expect(isRouteAllowedForRole("/profile", "ADMIN")).toBe(true);

      expect(isRouteAllowedForRole("/change-password", "STUDENT")).toBe(true);
      expect(isRouteAllowedForRole("/notifications", "STUDENT")).toBe(true);
      expect(isRouteAllowedForRole("/", "STUDENT")).toBe(true);
      expect(isRouteAllowedForRole("/courses", "STUDENT")).toBe(true);
    });
  });

  describe("getDefaultLandingPage", () => {
    it("returns /en/admin for ADMIN", () => {
      expect(getDefaultLandingPage("ADMIN")).toBe("/en/admin");
      expect(getDefaultLandingPage("ADMIN", "vi")).toBe("/vi/admin");
    });

    it("returns /en/teacher for TEACHER", () => {
      expect(getDefaultLandingPage("TEACHER")).toBe("/en/teacher");
      expect(getDefaultLandingPage("TEACHER", "vi")).toBe("/vi/teacher");
    });

    it("returns /en for STUDENT", () => {
      expect(getDefaultLandingPage("STUDENT")).toBe("/en");
      expect(getDefaultLandingPage("STUDENT", "vi")).toBe("/vi");
    });
  });

  describe("getPostLoginRedirect", () => {
    it("redirects to default landing page when returnUrl is empty, root, or auth page", () => {
      expect(getPostLoginRedirect("ADMIN", null)).toBe("/en/admin");
      expect(getPostLoginRedirect("TEACHER", "")).toBe("/en/teacher");
      expect(getPostLoginRedirect("STUDENT", "/")).toBe("/en");
      expect(getPostLoginRedirect("ADMIN", "/login")).toBe("/en/admin");
      expect(getPostLoginRedirect("STUDENT", "/register")).toBe("/en");
    });

    it("preserves valid returnUrl when role is permitted", () => {
      expect(getPostLoginRedirect("ADMIN", "/admin/users")).toBe("/en/admin/users");
      expect(getPostLoginRedirect("TEACHER", "/teacher/courses")).toBe("/en/teacher/courses");
      expect(getPostLoginRedirect("STUDENT", "/learn/my-course/lesson-1")).toBe("/en/learn/my-course/lesson-1");
      expect(getPostLoginRedirect("STUDENT", "/profile")).toBe("/en/profile");
    });

    it("safely falls back to default landing page when returnUrl is prohibited for role", () => {
      // The exact bug described by the user: Student logging in with returnUrl=/admin/users
      expect(getPostLoginRedirect("STUDENT", "/admin/users")).toBe("/en");
      expect(getPostLoginRedirect("STUDENT", "/teacher")).toBe("/en");
      expect(getPostLoginRedirect("TEACHER", "/admin/users")).toBe("/en/teacher");
      expect(getPostLoginRedirect("ADMIN", "/me/enrollments")).toBe("/en/admin");
    });

    it("rejects malicious or external returnUrl and falls back to default landing page", () => {
      expect(getPostLoginRedirect("STUDENT", "https://malicious.com")).toBe("/en");
      expect(getPostLoginRedirect("ADMIN", "//malicious.com")).toBe("/en/admin");
      expect(getPostLoginRedirect("TEACHER", "javascript:alert(1)")).toBe("/en/teacher");
    });
  });
});
