"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LocalizedLink } from "@/components/common/localized-link";

interface ErrorStatusViewProps {
  code: string | number;
  title: string;
  description: string;
  primaryActionLabel?: string;
  primaryActionHref?: string;
  showBackButton?: boolean;
  backButtonLabel?: string;
}

export function ErrorStatusView({
  code,
  title,
  description,
  primaryActionLabel,
  primaryActionHref = "/",
  showBackButton = true,
  backButtonLabel,
}: ErrorStatusViewProps) {
  const router = useRouter();

  return (
    <div className="w-full flex-1 flex items-center justify-center py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-canvas-soft">
      <div className="w-full max-w-4xl bg-surface border border-hairline/80 rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 lg:p-20 shadow-notion-soft">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-14 items-center">
          {/* Left Column: Huge Typographic Code */}
          <div className="flex items-center justify-center md:justify-end md:pr-4">
            <span
              className="text-8xl sm:text-9xl md:text-[150px] lg:text-[180px] font-bold font-mono tracking-tighter text-ink/10 select-none leading-none"
              aria-hidden="true"
            >
              {code}
            </span>
          </div>

          {/* Right Column: Title, Description, and Actions */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink whitespace-nowrap">
              {title}
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-ink-muted leading-relaxed max-w-md">
              {description}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              {showBackButton && (
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium border border-hairline bg-surface hover:bg-canvas-soft text-ink transition-colors shadow-2xs cursor-pointer active:scale-[0.98]"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-ink-muted" />
                  <span>{backButtonLabel || "Go Back"}</span>
                </button>
              )}

              {primaryActionLabel && (
                <LocalizedLink
                  href={primaryActionHref}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-notion-blue text-white hover:bg-notion-blue-active transition-colors shadow-xs active:scale-[0.98]"
                >
                  {primaryActionLabel}
                </LocalizedLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
