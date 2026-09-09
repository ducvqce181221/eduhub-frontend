"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, HelpCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";

export function FaqSection() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  const faqs = t.home.faqs || [];

  return (
    <section
      aria-labelledby="faq-heading"
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-hairline mt-8"
    >
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-notion-blue bg-surface border border-hairline shadow-2xs mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>EduHub Knowledge Base</span>
        </div>
        <h2 id="faq-heading" className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          {t.home.faqTitle}
        </h2>
        <p className="text-xs sm:text-sm text-ink-muted mt-2 max-w-lg mx-auto">
          {t.home.faqSubtitle}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-lg border border-hairline bg-surface overflow-hidden shadow-notion-soft transition-colors"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-canvas-soft/40 transition-colors cursor-pointer"
              >
                <span className="text-sm sm:text-base font-semibold text-ink pr-4 leading-snug">
                  {faq.q}
                </span>
                <span className="text-ink-muted shrink-0">
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-notion-blue" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-ink-faint" />
                  )}
                </span>
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-ink-secondary leading-relaxed border-t border-hairline/60 bg-canvas-soft/30">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
