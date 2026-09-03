"use client";

import React from "react";
import { Activity } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  breadcrumb: string;
}

export function AdminHeader({ title, breadcrumb }: AdminHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          {breadcrumb}
        </p>
        <h1 className="text-xl font-bold tracking-tight text-neutral-900">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Operational</span>
        </div>
      </div>
    </header>
  );
}
