"use client";

import React from "react";
import { LocalizedLink } from "@/components/common/localized-link";
import { useTranslation } from "@/lib/i18n/language-context";

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-hairline bg-canvas-soft mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
        <div className="flex items-center gap-2.5">
          <span className="size-5 rounded-md bg-notion-blue text-white flex items-center justify-center text-xs font-bold">
            E
          </span>
          <span className="font-semibold text-ink">{t.common.appName}</span>
          <span className="text-ink-faint">•</span>
          <span>{t.nav.allRightsReserved.replace("{year}", String(currentYear))}</span>
        </div>

        <div className="flex items-center gap-5 text-ink-secondary text-xs">
          <LocalizedLink href="/courses" className="hover:text-ink transition-colors">
            {t.catalog.allCourses}
          </LocalizedLink>
          <LocalizedLink href="/terms" className="hover:text-ink transition-colors">
            {t.nav.terms}
          </LocalizedLink>
          <LocalizedLink href="/privacy" className="hover:text-ink transition-colors">
            {t.nav.privacy}
          </LocalizedLink>
        </div>
      </div>
    </footer>
  );
}
