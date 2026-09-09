"use client";

import React from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/language-context";

export interface PublishChecklistState {
  hasMetadata: boolean;
  hasChapters: boolean;
  hasLessons: boolean;
  hasVideos: boolean;
  hasValidQuizzes: boolean;
  details?: string[];
}

interface PublishChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFixSection: (sectionKey: "metadata" | "curriculum" | "quiz") => void;
  checklist: PublishChecklistState;
}

export function PublishChecklistModal({
  isOpen,
  onClose,
  onFixSection,
  checklist,
}: PublishChecklistModalProps) {
  const { t } = useTranslation();

  const criteria = [
    {
      id: "metadata",
      label: t.teacher.criterionMetadata,
      description: t.teacher.criterionMetadataDesc,
      passed: checklist.hasMetadata,
      targetSection: "metadata" as const,
    },
    {
      id: "chapters",
      label: t.teacher.criterionChapters,
      description: t.teacher.criterionChaptersDesc,
      passed: checklist.hasChapters,
      targetSection: "curriculum" as const,
    },
    {
      id: "lessons",
      label: t.teacher.criterionLessons,
      description: t.teacher.criterionLessonsDesc,
      passed: checklist.hasLessons,
      targetSection: "curriculum" as const,
    },
    {
      id: "videos",
      label: t.teacher.criterionVideos,
      description: t.teacher.criterionVideosDesc,
      passed: checklist.hasVideos,
      targetSection: "curriculum" as const,
    },
    {
      id: "quizzes",
      label: t.teacher.criterionQuizzes,
      description: t.teacher.criterionQuizzesDesc,
      passed: checklist.hasValidQuizzes,
      targetSection: "quiz" as const,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl rounded-lg border border-hairline bg-surface p-6 shadow-notion-elevated">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sticker-orange/15 text-sticker-orange-deep border border-transparent shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-ink">
                {t.teacher.checklistTitle}
              </DialogTitle>
              <DialogDescription className="text-xs text-ink-muted">
                {t.teacher.checklistDescBr}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Checklist items list */}
        <div className="my-2 space-y-2.5">
          {criteria.map((item) => (
            <div
              key={item.id}
              className={`flex items-start justify-between rounded-lg border p-3 transition-colors ${
                item.passed
                  ? "border-sticker-teal/25 bg-sticker-teal/5 dark:bg-teal-500/10 dark:border-teal-500/25"
                  : "border-sticker-orange/30 bg-sticker-orange/5 dark:bg-orange-500/10 dark:border-orange-500/25"
              }`}
            >
              <div className="flex items-start gap-3">
                {item.passed ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sticker-teal dark:text-teal-400" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-sticker-orange-deep dark:text-orange-400" />
                )}
                <div>
                  <h4 className="text-sm font-semibold text-ink">
                    {item.label}
                  </h4>
                  <p className="mt-0.5 text-xs text-ink-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {!item.passed && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onClose();
                    onFixSection(item.targetSection);
                  }}
                  className="ml-3 shrink-0 rounded-full border-hairline bg-surface text-xs font-medium text-ink hover:bg-canvas-soft cursor-pointer"
                >
                  {t.teacher.fixSection} <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Detailed error bullets if present */}
        {checklist.details && checklist.details.length > 0 && (
          <div className="rounded-lg bg-canvas-soft border border-hairline p-3 text-xs text-ink-secondary">
            <h5 className="font-semibold text-ink">{t.teacher.checklistIssuesFound}</h5>
            <ul className="mt-1.5 list-inside list-disc space-y-1 text-ink-muted">
              {checklist.details.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter className="mt-3 flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full border-hairline text-xs text-ink-secondary hover:bg-canvas-soft px-4 cursor-pointer"
          >
            {t.common.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
