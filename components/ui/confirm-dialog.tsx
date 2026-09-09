"use client";

import React, { useState } from "react";
import { Loader2, AlertTriangle, Trash2, CheckCircle2, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary" | "default";
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = isLoading || internalLoading;

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
      onOpenChange(false);
    } catch {
      // Handled by parent
    } finally {
      setInternalLoading(false);
    }
  };

  const renderIcon = () => {
    switch (variant) {
      case "danger":
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Trash2 className="h-5 w-5" />
          </div>
        );
      case "warning":
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-sticker-amber/20 bg-sticker-amber/15 text-sticker-amber-deep dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5" />
          </div>
        );
      case "primary":
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-sticker-teal/20 bg-sticker-teal/15 text-sticker-teal dark:border-teal-500/30 dark:bg-teal-500/15 dark:text-teal-300">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        );
      default:
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-hairline bg-canvas-soft text-ink-muted">
            <HelpCircle className="h-5 w-5" />
          </div>
        );
    }
  };

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case "danger":
        return "bg-rose-600 hover:bg-rose-700 text-white shadow-notion-soft";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white shadow-notion-soft";
      case "primary":
      default:
        return "bg-notion-blue hover:bg-notion-blue-hover text-white shadow-notion-soft";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !loading && onOpenChange(val)}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-100 rounded-lg border border-hairline bg-surface p-6 shadow-notion-dropdown text-center"
      >
        {/* Calm Icon */}
        <div className="flex justify-center mb-1">{renderIcon()}</div>

        {/* Title & Description */}
        <div className="mt-2">
          <DialogTitle className="text-base font-semibold text-ink tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-xs text-ink-muted leading-relaxed">
            {description}
          </DialogDescription>
        </div>

        {/* Action Buttons Grid */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 w-full">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
            className="w-full rounded-full border border-hairline bg-surface py-2 text-xs font-medium text-ink hover:bg-canvas-soft transition-colors"
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className={`w-full rounded-full py-2 text-xs font-medium transition-colors ${getConfirmButtonClasses()}`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
