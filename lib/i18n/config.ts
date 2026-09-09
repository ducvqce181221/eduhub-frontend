export const locales = ["en", "vi"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE_KEY = "eduhub_lang";

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getCleanPathname(pathname: string): string {
  const segments = pathname.split("/");
  if (segments[1] && isValidLocale(segments[1])) {
    return "/" + segments.slice(2).join("/");
  }
  return pathname;
}
