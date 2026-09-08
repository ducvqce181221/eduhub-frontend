"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n/language-context";

interface AdminHeaderProps {
  title: string;
  breadcrumb: string;
}

export function AdminHeader({ title, breadcrumb }: AdminHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="flex min-h-[72px] items-center justify-between border-b border-hairline bg-surface px-6 sm:px-8 py-4 transition-colors">
      <div className="flex flex-col justify-center">
        <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted mb-1">
          {breadcrumb}
        </p>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 rounded-full border border-sticker-teal/30 bg-sticker-teal/15 px-3 py-1 text-xs font-medium text-sticker-teal dark:text-teal-300 dark:border-teal-500/30 dark:bg-teal-500/15">
          <span className="h-1.5 w-1.5 rounded-full bg-sticker-teal dark:bg-teal-400 animate-pulse" />
          <span>{t.admin.systemOperational}</span>
        </div>
      </div>
    </header>
  );
}
