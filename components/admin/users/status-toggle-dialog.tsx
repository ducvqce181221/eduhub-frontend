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
      setErrorMessage(err.message || "Failed to update account status");
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
                  : "bg-sticker-teal/15 text-sticker-teal border-sticker-teal/20"
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
                {user.isActive ? "Deactivate Account" : "Activate Account"}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs text-ink-muted pt-1">
            {user.isActive
              ? `Are you sure you want to deactivate ${user.fullName}'s account (${user.email})? Deactivated accounts cannot log in or access active sessions (BR-USR-03).`
              : `Are you sure you want to activate ${user.fullName}'s account (${user.email})? The user will immediately regain platform authentication.`}
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="rounded-md bg-rose-500/10 p-3 text-xs font-medium text-rose-600 dark:text-rose-400 border border-rose-500/20">
            {errorMessage}
          </div>
        )}

        <DialogFooter className="pt-3 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs font-medium border-hairline text-ink hover:bg-canvas-soft"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className={`text-xs font-medium text-white ${
              user.isActive
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-notion-blue hover:bg-notion-blue-hover"
            }`}
          >
            {isSubmitting
              ? "Processing..."
              : user.isActive
                ? "Confirm Deactivation"
                : "Confirm Activation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
