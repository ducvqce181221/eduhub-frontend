"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
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

  const renderIllustration = () => {
    if (variant === "danger") {
      return (
        <div className="relative mx-auto flex w-28 items-center justify-center select-none">
          {/* Sparkles / Crosses decoration */}
          <span className="absolute top-2 left-3 text-rose-500 font-bold text-sm select-none animate-pulse">+</span>
          <span className="absolute top-3 right-4 text-rose-500 font-bold text-sm select-none animate-pulse">+</span>
          <span className="absolute bottom-7 left-1 text-rose-400 font-bold text-xs select-none">+</span>
          <span className="absolute top-9 left-1 h-1.5 w-1.5 rounded-full bg-rose-400"></span>
          <span className="absolute top-10 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-400"></span>
          <span className="absolute bottom-9 right-4 h-1 w-1 rounded-full bg-rose-300"></span>

          {/* Red Trashcan SVG */}
          <svg
            width="76"
            height="76"
            viewBox="0 0 68 68"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10 drop-shadow-sm transition-transform duration-300 hover:scale-105"
          >
            {/* Can Top Handle */}
            <path
              d="M29 20C29 18.3431 30.3431 17 32 17H36C37.6569 17 39 18.3431 39 20H29Z"
              fill="#FF3B30"
            />
            {/* Can Lid */}
            <rect
              x="21"
              y="20.5"
              width="26"
              height="4.5"
              rx="2.25"
              fill="#FF3B30"
            />
            {/* Can Body */}
            <path
              d="M24.5 27.5L27 50.2C27.15 51.5 28.25 52.5 29.55 52.5H38.45C39.75 52.5 40.85 51.5 41 50.2L43.5 27.5H24.5Z"
              fill="#FF3B30"
            />
            {/* White Vertical Slots */}
            <rect x="29.5" y="32" width="2" height="14" rx="1" fill="white" />
            <rect x="33" y="32" width="2" height="14" rx="1" fill="white" />
            <rect x="36.5" y="32" width="2" height="14" rx="1" fill="white" />
          </svg>
        </div>
      );
    }

    if (variant === "warning") {
      return (
        <div className="relative mx-auto flex w-28 items-center justify-center select-none">
          <span className="absolute top-2 left-3 text-amber-500 font-bold text-sm select-none animate-pulse">+</span>
          <span className="absolute top-3 right-4 text-amber-500 font-bold text-sm select-none animate-pulse">+</span>
          <span className="absolute bottom-7 left-1 text-amber-400 font-bold text-xs select-none">+</span>
          <span className="absolute top-9 left-1 h-1.5 w-1.5 rounded-full bg-amber-400"></span>
          <span className="absolute top-10 right-1.5 h-1.5 w-1.5 rounded-full bg-amber-400"></span>

          {/* Warning Icon SVG */}
          <svg
            width="74"
            height="74"
            viewBox="0 0 68 68"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10 drop-shadow-sm transition-transform duration-300 hover:scale-105"
          >
            <path
              d="M34 16L49 46C49.8 47.6 48.6 49.5 46.8 49.5H21.2C19.4 49.5 18.2 47.6 19 46L34 16Z"
              fill="#F59E0B"
            />
            <rect x="32.5" y="28" width="3" height="10" rx="1.5" fill="white" />
            <circle cx="34" cy="42.5" r="1.75" fill="white" />
          </svg>

        </div>
      );
    }

    // Primary (Publish / Positive confirmation)
    return (
      <div className="relative mx-auto flex w-28 items-center justify-center select-none">
        <span className="absolute top-2 left-3 text-sky-500 font-bold text-sm select-none animate-pulse">+</span>
        <span className="absolute top-3 right-4 text-sky-500 font-bold text-sm select-none animate-pulse">+</span>
        <span className="absolute bottom-7 left-1 text-sky-400 font-bold text-xs select-none">+</span>
        <span className="absolute top-9 left-1 h-1.5 w-1.5 rounded-full bg-sky-400"></span>
        <span className="absolute top-10 right-1.5 h-1.5 w-1.5 rounded-full bg-sky-400"></span>

        {/* Check Cloud SVG */}
        <svg
          width="74"
          height="74"
          viewBox="0 0 68 68"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 drop-shadow-sm transition-transform duration-300 hover:scale-105"
        >
          <circle cx="34" cy="34" r="18" fill="#0075DE" />
          <path
            d="M27 34L32 39L41 29"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

      </div>
    );
  };

  const getButtonStyles = () => {
    switch (variant) {
      case "danger":
        return "bg-[#ff3b30] hover:bg-[#e03126] text-white shadow-md shadow-red-500/20";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20";
      case "primary":
        return "bg-[#0075de] hover:bg-[#005bab] text-white shadow-md shadow-blue-500/20";
      default:
        return "bg-neutral-900 hover:bg-neutral-800 text-white shadow-md";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !loading && onOpenChange(val)}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[380px] rounded-3xl border-0 bg-white p-6 sm:p-8 text-center shadow-2xl overflow-hidden"
      >
        {/* Playful Central Graphic */}
        {renderIllustration()}

        {/* Title & Description */}
        <div className="mt-1">
          <DialogTitle className="text-lg font-bold text-neutral-900 tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="mt-2 text-xs text-neutral-500 font-normal leading-relaxed">
            {description}
          </DialogDescription>
        </div>

        {/* Action Buttons Grid matching reference mockup */}
        <div className="mt-6 grid grid-cols-2 gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 active:scale-95 transition-all shadow-2xs"
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className={`w-full rounded-xl py-2.5 text-xs font-semibold active:scale-95 transition-all ${getButtonStyles()}`}
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
