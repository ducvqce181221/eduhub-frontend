import type { Role } from "@/types/api";
import { isValidLocale, defaultLocale, type Locale } from "@/lib/i18n/config";

/**
 * Strips the leading locale prefix (/en or /vi) from a path.
 */
export function stripLocale(path: string): string {
  if (!path) return "/";
  const clean = path.split("?")[0].split("#")[0];
  const segments = clean.split("/");
  if (segments[1] && isValidLocale(segments[1])) {
    const rest = "/" + segments.slice(2).join("/");
    return rest === "" ? "/" : rest;
  }
  return clean || "/";
}

/**
 * Ensures that a path has the specified locale prefix.
 */
export function ensureLocale(path: string, locale: Locale = defaultLocale): string {
  if (!path || path === "/") return `/${locale}`;
  const segments = path.split("/");
  if (segments[1] && isValidLocale(segments[1])) {
    segments[1] = locale;
    return segments.join("/") || `/${locale}`;
  }
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Checks whether a given path is authorized for the specified user role.
 */
export function isRouteAllowedForRole(path: string, role: Role): boolean {
  if (!path) return false;

  // Normalize path by stripping locale and query params
  const cleanPath = stripLocale(path);

  // Admin section: Admin only
  if (cleanPath === "/admin" || cleanPath.startsWith("/admin/")) {
    return role === "ADMIN";
  }

  // Teacher dashboard & course builder: Teacher or Admin
  if (cleanPath === "/teacher" || cleanPath.startsWith("/teacher/")) {
    return role === "TEACHER" || role === "ADMIN";
  }

  // Student specific learning & enrollments
  if (
    cleanPath === "/me/enrollments" ||
    cleanPath.startsWith("/me/enrollments/") ||
    cleanPath === "/enrollments" ||
    cleanPath.startsWith("/enrollments/") ||
    cleanPath === "/learn" ||
    cleanPath.startsWith("/learn/")
  ) {
    return role === "STUDENT";
  }

  // Public and common authenticated routes (/profile, /change-password, /notifications, /, /courses, etc.)
  return true;
}

/**
 * Returns the default dashboard/landing route for each user role with locale prefix.
 */
export function getDefaultLandingPage(role: Role, locale: Locale = defaultLocale): string {
  switch (role) {
    case "ADMIN":
      return `/${locale}/admin`;
    case "TEACHER":
      return `/${locale}/teacher`;
    case "STUDENT":
    default:
      return `/${locale}`;
  }
}

/**
 * Computes the safest and most appropriate post-login redirect path.
 * Validates role permissions to prevent 403 Access Denied errors and attaches locale.
 */
export function getPostLoginRedirect(
  role: Role,
  returnUrl?: string | null,
  locale: Locale = defaultLocale,
): string {
  if (!returnUrl || typeof returnUrl !== "string") {
    return getDefaultLandingPage(role, locale);
  }

  const trimmed = returnUrl.trim();

  // Guard against external redirects or malformed paths
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return getDefaultLandingPage(role, locale);
  }

  const cleanPath = stripLocale(trimmed);

  // If returnUrl points to auth screens or root, resolve to default landing page
  if (
    cleanPath === "/" ||
    cleanPath === "/login" ||
    cleanPath === "/register" ||
    cleanPath.startsWith("/login?") ||
    cleanPath.startsWith("/register?")
  ) {
    return getDefaultLandingPage(role, locale);
  }

  // If user role is allowed on this route, preserve their target destination with active locale
  if (isRouteAllowedForRole(cleanPath, role)) {
    return ensureLocale(trimmed, locale);
  }

  // Otherwise, fallback safely to the role's default landing page
  return getDefaultLandingPage(role, locale);
}
