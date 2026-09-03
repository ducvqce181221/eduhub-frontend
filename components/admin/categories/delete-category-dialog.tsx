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
      <DialogContent className="sm:max-w-md rounded-xl bg-white p-6 shadow-xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-neutral-900">
                Delete Category
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs text-neutral-500 pt-1">
            Are you sure you want to permanently delete the category{" "}
            <strong className="text-neutral-900 font-semibold">
              {category.name}
            </strong>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-rose-600" />
            <div>
              <p className="font-semibold">{errorMessage}</p>
              <p className="mt-0.5 text-[11px] text-rose-600">
                Please reassign existing courses to another category, or set this category to Inactive instead of deleting it.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="pt-3 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs font-medium border-neutral-200"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleDelete}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium"
          >
            {isSubmitting ? "Deleting..." : "Delete Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
