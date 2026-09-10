import { format, formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import type { Locale } from "./config";
import type { Role, CourseLevel, CourseStatus, NotificationType } from "@/types/api";
import type { Dictionary } from "./dictionaries/en";

const dateLocales = {
  vi,
  en: enUS,
};

export function formatRelativeTime(date: Date | string | number, locale: Locale): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return formatDistanceToNow(d, {
    addSuffix: true,
    locale: dateLocales[locale] || dateLocales.en,
  });
}

export function formatDate(
  date: Date | string | number,
  formatString: string = "PPP",
  locale: Locale = "en",
): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return format(d, formatString, {
    locale: dateLocales[locale] || dateLocales.en,
  });
}

/**
 * Formats a short calendar date according to locale standards:
 * - Vietnamese ('vi'): ngày/tháng/năm (dd/MM/yyyy)
 * - International ('en' / others): tháng/ngày/năm (MM/dd/yyyy)
 */
export function formatShortDate(
  date?: Date | string | number | null,
  locale: Locale = "en",
  fallback: string = "N/A",
): string {
  if (!date) return fallback;
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return fallback;
  const formatPattern = locale === "vi" ? "dd/MM/yyyy" : "MM/dd/yyyy";
  return format(d, formatPattern, {
    locale: dateLocales[locale] || dateLocales.en,
  });
}

/**
 * Backward-compatible alias for joined/registration dates
 */
export const formatJoinedDate = formatShortDate;

export function translateRole(role: Role, t: Dictionary): string {
  return t.enums.role[role] || role;
}

export function translateCourseLevel(level: CourseLevel, t: Dictionary): string {
  return t.enums.level[level] || level;
}

export function translateCourseStatus(status: CourseStatus, t: Dictionary): string {
  return t.enums.status[status] || status;
}

export function translateNotificationType(type: NotificationType, t: Dictionary): string {
  return t.enums.notificationType[type] || type;
}
