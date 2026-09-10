"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { LocalizedLink } from "@/components/common/localized-link";
import { useTranslation } from "@/lib/i18n/language-context";

export default function AboutPage() {
  const { t } = useTranslation();

  const values = [
    {
      num: t.about.val1Num,
      title: t.about.val1Title,
      body: t.about.val1Body,
    },
    {
      num: t.about.val2Num,
      title: t.about.val2Title,
      body: t.about.val2Body,
    },
    {
      num: t.about.val3Num,
      title: t.about.val3Title,
      body: t.about.val3Body,
    },
  ];

  return (
    <article className="w-full bg-canvas-soft flex-1 py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Editorial Header */}
        <header className="space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink leading-tight text-balance">
            {t.about.headline}
          </h1>

          <p className="text-base sm:text-lg text-ink-secondary leading-relaxed max-w-2xl">
            {t.about.intro}
          </p>
        </header>

        {/* Narrative Paragraph */}
        <section className="p-6 sm:p-8 rounded-2xl bg-surface border border-hairline/80 shadow-notion-soft">
          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
            {t.about.manifestoParagraph}
          </p>
        </section>

        {/* What We Stand For (Editorial List with Hairlines) */}
        <section className="space-y-6 pt-4">
          <p className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider">
            {t.about.valuesTitle}
          </p>

          <div className="divide-y divide-hairline border-t border-b border-hairline bg-surface rounded-2xl border px-6 sm:px-8 shadow-notion-soft">
            {values.map((v, i) => (
              <div key={i} className="py-6 sm:py-7 flex flex-col sm:flex-row gap-2 sm:gap-6">
                <span className="font-mono text-xs font-semibold text-ink-faint sm:pt-1 select-none">
                  {v.num}
                </span>
                <div className="space-y-1.5 flex-1">
                  <h2 className="text-base font-semibold text-ink tracking-tight">
                    {v.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-xl">
                    {v.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quiet Closing Action */}
        <footer className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-hairline">
          <p className="text-sm text-ink-secondary font-medium">
            {t.about.closing}
          </p>

          <LocalizedLink
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-notion-blue text-white text-xs sm:text-sm font-medium hover:bg-notion-blue-active transition-colors shadow-xs self-start sm:self-auto active:scale-[0.98]"
          >
            <span>{t.about.exploreCourses}</span>
            <ArrowRight className="w-4 h-4" />
          </LocalizedLink>
        </footer>
      </div>
    </article>
  );
}
