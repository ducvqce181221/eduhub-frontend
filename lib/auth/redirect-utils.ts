import type { Role } from "@/types/api";

/**
 * Checks whether a given path is authorized for the specified user role.
 */
export function isRouteAllowedForRole(path: string, role: Role): boolean {
  if (!path) return false;

  // Normalize path by stripping query params and hash
  const cleanPath = path.split("?")[0].split("#")[0];

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
 * Returns the default dashboard/landing route for each user role.
 */
export function getDefaultLandingPage(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "TEACHER":
      return "/teacher";
    case "STUDENT":
    default:
      return "/";
  }
}

/**
 * Computes the safest and most appropriate post-login redirect path.
 * Validates role permissions to prevent 403 Access Denied errors.
 */
export function getPostLoginRedirect(role: Role, returnUrl?: string | null): string {
  if (!returnUrl || typeof returnUrl !== "string") {
    return getDefaultLandingPage(role);
  }

  const trimmed = returnUrl.trim();

  // Guard against external redirects or empty paths
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return getDefaultLandingPage(role);
  }

  // If returnUrl points to auth screens or root, resolve to default landing page
  if (
    trimmed === "/" ||
    trimmed === "/login" ||
    trimmed === "/register" ||
    trimmed.startsWith("/login?") ||
    trimmed.startsWith("/register?")
  ) {
    return getDefaultLandingPage(role);
  }

  // If user role is allowed on this route, preserve their target destination
  if (isRouteAllowedForRole(trimmed, role)) {
    return trimmed;
  }

  // Otherwise, fallback safely to the role's default landing page
  return getDefaultLandingPage(role);
}
