import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale, LOCALE_COOKIE_KEY, isValidLocale } from "./lib/i18n/config";

/**
 * Next.js 16 Proxy convention (superseding deprecated middleware.ts)
 * Handles sub-path locale detection, redirection, and cookie synchronization.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Check if URL has a valid locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (pathnameHasLocale) {
    const currentLocale = pathname.split("/")[1];
    const cookieLocale = request.cookies.get(LOCALE_COOKIE_KEY)?.value;

    const response = NextResponse.next();

    // Keep cookie in sync with active URL locale
    if (currentLocale && isValidLocale(currentLocale) && cookieLocale !== currentLocale) {
      response.cookies.set(LOCALE_COOKIE_KEY, currentLocale, {
        path: "/",
        maxAge: 31536000,
        sameSite: "lax",
      });
    }

    return response;
  }

  // Determine target locale for redirection
  let targetLocale = defaultLocale;

  // 1. Prioritize persisted user preference in cookie
  const cookieLang = request.cookies.get(LOCALE_COOKIE_KEY)?.value;
  if (cookieLang && isValidLocale(cookieLang)) {
    targetLocale = cookieLang;
  } else {
    // 2. Inspect Accept-Language browser header
    const acceptLanguage = request.headers.get("accept-language");
    if (acceptLanguage) {
      const lower = acceptLanguage.toLowerCase();
      // If Vietnamese is preferred
      if (lower.startsWith("vi") || lower.includes(",vi")) {
        targetLocale = "vi";
      }
    }
  }

  // Construct target redirect URL
  const targetPath = pathname === "/" ? `/${targetLocale}` : `/${targetLocale}${pathname}`;
  const redirectUrl = new URL(`${targetPath}${search}`, request.url);

  const response = NextResponse.redirect(redirectUrl, 307);
  response.cookies.set(LOCALE_COOKIE_KEY, targetLocale, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - static files with extensions (e.g. .svg, .png, .jpg, .css, .js)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};
