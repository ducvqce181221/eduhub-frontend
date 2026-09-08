"use client";

import React, { useEffect, useRef } from "react";
import { X, Play, Video, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";
import { formatDuration } from "@/components/courses/curriculum-outline";
import type { CoursePreviewVideo } from "@/lib/api/courses";

interface CoursePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  courseId: string;
  previewData?: CoursePreviewVideo | null;
  isLoading?: boolean;
  isEnrolled?: boolean;
  isAuthenticated?: boolean;
  onEnroll?: () => void;
}

export function CoursePreviewModal({
  isOpen,
  onClose,
  courseTitle,
  courseId,
  previewData,
  isLoading = false,
  isEnrolled = false,
  isAuthenticated = false,
  onEnroll,
}: CoursePreviewModalProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Pause video on close
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Backdrop click listener */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-3xl rounded-xl bg-surface border border-hairline shadow-notion-dropdown overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-hairline bg-surface">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-notion-blue bg-notion-blue/10 border border-notion-blue/20">
                <Video className="w-3 h-3" />
                <span>{t.course.previewBadge}</span>
              </span>
              <span className="text-xs text-ink-muted truncate hidden sm:inline">
                {courseTitle}
              </span>
            </div>
            <h2
              id="preview-modal-title"
              className="text-base sm:text-lg font-bold text-ink truncate mt-1"
            >
              {previewData?.lessonTitle || t.course.previewModalTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-muted hover:text-ink hover:bg-canvas-soft transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player Area */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 text-neutral-400">
              <div className="w-8 h-8 rounded-full border-2 border-neutral-600 border-t-notion-blue animate-spin" />
              <span className="text-xs">{t.common.loading}</span>
            </div>
          ) : (previewData?.previewUrl || previewData?.videoUrl) ? (
            <video
              ref={videoRef}
              src={previewData.previewUrl || previewData.videoUrl}
              controls
              playsInline
              autoPlay
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="flex flex-col items-center gap-2 text-neutral-400 p-6 text-center">
              <AlertCircle className="w-8 h-8 text-neutral-500" />
              <p className="text-sm font-medium text-neutral-300">
                No preview video available for this course
              </p>
              <p className="text-xs text-neutral-500 max-w-sm">
                This course may not contain video lessons yet, or the instructor has not configured an introductory preview.
              </p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-4 sm:p-5 bg-canvas-soft border-t border-hairline flex flex-col gap-1 text-left">
          <p className="text-xs sm:text-sm font-medium text-ink">
            {t.course.previewEnrollPrompt}
          </p>
          {previewData?.durationSeconds && (
            <p className="text-xs text-ink-muted flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-ink-faint" />
              <span>
                Introductory lesson: {formatDuration(previewData.durationSeconds)}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
