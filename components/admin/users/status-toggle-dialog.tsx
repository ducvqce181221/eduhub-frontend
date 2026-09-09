"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";
import type { User } from "@/types/api";

interface StatusToggleDialogProps {
  open: boolean;
  user: User | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (isActive: boolean) => Promise<void> | void;
}

export function StatusToggleDialog({
  open,
  user,
  onOpenChange,
  onConfirm,
}: StatusToggleDialogProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!user) return null;

  const nextStatus = !user.isActive;

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await onConfirm(nextStatus);
      onOpenChange(false);
    } catch (err: any) {
      setErrorMessage(err.message || t.admin.accountStatusUpdateFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-lg bg-surface border border-hairline p-6 shadow-notion-dropdown">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-md border ${
                user.isActive
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                  : "bg-sticker-teal/15 text-sticker-teal border-sticker-teal/20 dark:text-teal-300 dark:border-teal-500/30 dark:bg-teal-500/15"
              }`}
            >
              {user.isActive ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-ink">
                {user.isActive ? t.admin.deactivateAccountTitle : t.admin.activateAccountTitle}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs text-ink-muted pt-1">
            {user.isActive
              ? t.admin.deactivateConfirmDesc
                  .replace("{name}", user.fullName)
                  .replace("{email}", user.email)
              : t.admin.activateConfirmDesc
                  .replace("{name}", user.fullName)
                  .replace("{email}", user.email)}
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="rounded-md bg-rose-500/10 p-3 text-xs font-medium text-rose-600 dark:text-rose-400 border border-rose-500/20">
            {errorMessage}
          </div>
        )}

        <DialogFooter className="pt-3 gap-2 sm:gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full text-xs font-medium border-hairline text-ink hover:bg-canvas-soft px-4"
          >
            {t.common.cancel}
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className={`rounded-full text-xs font-medium text-white px-4 shadow-notion-soft ${
              user.isActive
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-notion-blue hover:bg-notion-blue-hover"
            }`}
          >
            {isSubmitting
              ? t.common.processing
              : user.isActive
                ? t.admin.confirmDeactivate
                : t.admin.confirmActivate}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
