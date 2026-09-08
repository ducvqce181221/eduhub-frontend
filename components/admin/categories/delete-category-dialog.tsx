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
import { AlertTriangle, AlertCircle } from "lucide-react";
import type { Category } from "@/types/api";

interface DeleteCategoryDialogProps {
  open: boolean;
  category: Category | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => Promise<void> | void;
}

export function DeleteCategoryDialog({
  open,
  category,
  onOpenChange,
  onConfirm,
}: DeleteCategoryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!category) return null;

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await onConfirm(category.id);
      onOpenChange(false);
    } catch (err: any) {
      // Surface 409 Conflict error from API per BR-CAT-02
      setErrorMessage(err.message || "Failed to delete category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setErrorMessage(null);
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-md rounded-lg bg-surface border border-hairline p-6 shadow-notion-dropdown">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-ink">
                Delete Category
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs text-ink-muted pt-1">
            Are you sure you want to permanently delete the category{" "}
            <strong className="text-ink font-medium">
              {category.name}
            </strong>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-md border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-semibold">{errorMessage}</p>
              <p className="mt-0.5 text-[11px] opacity-80">
                Please reassign existing courses to another category, or set this category to Inactive instead of deleting it.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="pt-3 gap-2 sm:gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full text-xs font-medium border-hairline text-ink hover:bg-canvas-soft px-4"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleDelete}
            className="rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium px-4 shadow-notion-soft"
          >
            {isSubmitting ? "Deleting..." : "Delete Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
