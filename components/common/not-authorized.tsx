"use client";

import React from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { LocalizedLink } from "@/components/common/localized-link";
import { useTranslation } from "@/lib/i18n/language-context";

export function NotAuthorized() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-canvas-soft">
      <div className="w-16 h-16 rounded-full bg-sticker-orange/10 text-sticker-orange flex items-center justify-center mb-6 border border-sticker-orange/20">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-ink mb-2">
        {t.common.accessDeniedTitle}
      </h1>
      <p className="text-ink-muted max-w-md mb-8 text-sm leading-relaxed">
        {t.common.accessDeniedDesc}
      </p>
      <LocalizedLink
        href="/"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-notion-blue text-white text-sm font-medium hover:bg-notion-blue-active transition-colors shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        {t.common.backToHome}
      </LocalizedLink>
    </div>
  );
}
