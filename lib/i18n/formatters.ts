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
