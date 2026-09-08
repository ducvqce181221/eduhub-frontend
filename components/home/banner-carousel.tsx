"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useActiveBannersQuery } from "@/hooks/use-banners";
import { useTranslation } from "@/lib/i18n/language-context";
import type { Banner } from "@/lib/api/banners";

export function BannerCarousel() {
  const { data: banners = [], isLoading } = useActiveBannersQuery();
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fallback default slide if no promotional banners exist in database yet
  const fallbackBanner: Banner = {
    id: "default-banner",
    title: "Master Modern Software Engineering",
    imageUrl: "",
    linkUrl: "#catalog",
    order: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const slides: Banner[] = banners.length > 0 ? banners : [fallbackBanner];
  const slideCount = slides.length;

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  // Auto-slide interval
  useEffect(() => {
    if (isPaused || slideCount <= 1) return;

    timerRef.current = setInterval(() => {
      handleNext();
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, slideCount, handleNext]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
  };

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <section
      aria-label="Promotional Banners"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative w-full rounded-xl overflow-hidden border border-hairline shadow-notion-soft bg-surface group">
        {/* Aspect Ratio Container: 3:1 on desktop, 2:1 on tablet, min-height preserved */}
        <div className="relative w-full aspect-[2.8/1] sm:aspect-[3/1] min-h-[200px] md:min-h-[320px] lg:min-h-[380px] bg-canvas-soft">
          {isLoading ? (
            <div className="w-full h-full animate-pulse bg-canvas-soft flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-hairline border-t-notion-blue animate-spin" />
            </div>
          ) : currentSlide.imageUrl ? (
            // Render Real Uploaded Banner
            <div className="relative w-full h-full">
              {currentSlide.linkUrl ? (
                <Link
                  href={currentSlide.linkUrl}
                  className="block w-full h-full relative cursor-pointer"
                >
                  <img
                    src={currentSlide.imageUrl}
                    alt={currentSlide.title}
                    className="w-full h-full object-cover select-none transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                  />
                </Link>
              ) : (
                <img
                  src={currentSlide.imageUrl}
                  alt={currentSlide.title}
                  className="w-full h-full object-cover select-none"
                />
              )}
            </div>
          ) : (
            // Default Polished Promo Slide
            <div className="w-full h-full flex flex-col justify-center px-6 sm:px-12 md:px-16 bg-gradient-to-r from-canvas to-canvas-soft">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-notion-blue bg-surface border border-hairline shadow-2xs mb-3 sm:mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.catalog.heroBadge}</span>
                </span>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-ink tracking-tight leading-tight mb-2 sm:mb-3">
                  Master Modern Software Engineering
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-ink-muted line-clamp-2 sm:line-clamp-3 mb-4 sm:mb-6 max-w-xl">
                  {t.catalog.curriculumSubtitle}
                </p>
                <Link
                  href="#catalog"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-notion-blue hover:bg-notion-blue-active shadow-notion-soft transition-colors"
                >
                  {t.nav.explore}
                </Link>
              </div>
            </div>
          )}

          {/* Navigation Arrows (Visible on hover / desktop, touchable on mobile) */}
          {slideCount > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous slide"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-surface/90 hover:bg-surface border border-hairline shadow-notion-soft flex items-center justify-center text-ink opacity-80 hover:opacity-100 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next slide"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-surface/90 hover:bg-surface border border-hairline shadow-notion-soft flex items-center justify-center text-ink opacity-80 hover:opacity-100 transition-all cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Bottom Indicators (Pill Dots) */}
          {slideCount > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface/80 backdrop-blur-xs border border-hairline shadow-2xs">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id || idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex
                      ? "w-5 bg-notion-blue"
                      : "w-1.5 bg-ink-faint hover:bg-ink-muted"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
