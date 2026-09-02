import React from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
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
  const criteria = [
    {
      id: "metadata",
      label: "Basic Information & Thumbnail",
      description: "Title, non-empty description, active category, level, and thumbnail image.",
      passed: checklist.hasMetadata,
      targetSection: "metadata" as const,
    },
    {
      id: "chapters",
      label: "Curriculum Chapters (≥ 1 Chapter)",
      description: "Course must have at least one structured chapter.",
      passed: checklist.hasChapters,
      targetSection: "curriculum" as const,
    },
    {
      id: "lessons",
      label: "Chapter Lessons (≥ 1 Lesson per Chapter)",
      description: "Every chapter must contain at least one learning lesson.",
      passed: checklist.hasLessons,
      targetSection: "curriculum" as const,
    },
    {
      id: "videos",
      label: "Lesson Videos (Uploaded & Duration > 0)",
      description: "Every lesson must strictly possess a valid video with duration > 0s.",
      passed: checklist.hasVideos,
      targetSection: "curriculum" as const,
    },
    {
      id: "quizzes",
      label: "Lesson Quizzes (Valid Questions & Answers)",
      description: "Any attached quiz must have ≥ 1 question with ≥ 2 answers & 1 correct option.",
      passed: checklist.hasValidQuizzes,
      targetSection: "quiz" as const,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-200">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-neutral-900">
                Course Publish Checklist
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-500">
                BR-CRS-02 requires all 5 criteria to pass before publishing your course.
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
                  ? "border-emerald-100 bg-emerald-50/40"
                  : "border-amber-200 bg-amber-50/40"
              }`}
            >
              <div className="flex items-start gap-3">
                {item.passed ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                )}
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900">
                    {item.label}
                  </h4>
                  <p className="mt-0.5 text-xs text-neutral-500">
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
                  className="ml-3 shrink-0 rounded-md border-amber-200 bg-white text-xs font-medium text-amber-800 hover:bg-amber-100"
                >
                  Fix <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Detailed error bullets if present */}
        {checklist.details && checklist.details.length > 0 && (
          <div className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-700">
            <h5 className="font-semibold text-neutral-900">Specific issues found:</h5>
            <ul className="mt-1.5 list-inside list-disc space-y-1 text-neutral-600">
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
            className="rounded-md border-neutral-200 text-xs"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
