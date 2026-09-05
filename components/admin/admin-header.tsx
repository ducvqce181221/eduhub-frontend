"use client";

import React from "react";

interface AdminHeaderProps {
  title: string;
  breadcrumb: string;
}

export function AdminHeader({ title, breadcrumb }: AdminHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-hairline bg-surface px-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
          {breadcrumb}
        </p>
        <h1 className="text-lg font-semibold tracking-tight text-ink">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-sticker-teal/20 bg-sticker-teal/15 px-3 py-1 text-xs font-medium text-sticker-teal">
          <span className="h-1.5 w-1.5 rounded-full bg-sticker-teal animate-pulse" />
          <span>System Operational</span>
        </div>
      </div>
    </header>
  );
}
