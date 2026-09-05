"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Category, CreateCategoryPayload } from "@/types/api";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  slug: z.string().max(120).optional(),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormDialogProps {
  open: boolean;
  category?: Category | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateCategoryPayload) => Promise<void> | void;
}

export function CategoryFormDialog({
  open,
  category,
  onOpenChange,
  onSubmit,
}: CategoryFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEdit = !!category;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        isActive: category.isActive,
      });
    } else {
      reset({
        name: "",
        slug: "",
        description: "",
        isActive: true,
      });
    }
    setSubmitError(null);
  }, [category, reset, open]);

  // Slugify helper
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue("name", name, { shouldValidate: true });

    // Only auto-update slug if not in edit mode or slug was empty
    if (!isEdit) {
      const generatedSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", generatedSlug);
    }
  };

  const handleFormSubmit = async (values: CategoryFormValues) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await onSubmit({
        name: values.name.trim(),
        slug: values.slug?.trim() || undefined,
        description: values.description?.trim() || undefined,
        isActive: values.isActive,
      });
      reset();
      onOpenChange(false);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-lg bg-surface border border-hairline p-6 shadow-notion-dropdown">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base font-semibold text-ink">
            {isEdit ? "Edit Category" : "Create Category"}
          </DialogTitle>
          <DialogDescription className="text-xs text-ink-muted">
            {isEdit
              ? "Update course category details and active availability."
              : "Create a new topic category for platform course classification."}
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <div className="rounded-md bg-rose-500/10 p-3 text-xs font-medium text-rose-600 dark:text-rose-400 border border-rose-500/20">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          {/* Category Name */}
          <div className="space-y-1.5">
            <Label htmlFor="category-name" className="text-xs font-medium text-ink">
              Category Name
            </Label>
            <Input
              id="category-name"
              placeholder="e.g. Data Science"
              {...register("name")}
              onChange={handleNameChange}
              className="text-xs border-hairline bg-surface text-ink focus-visible:ring-notion-blue placeholder:text-ink-muted"
            />
            {errors.name && (
              <p className="text-[11px] font-medium text-rose-600">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="category-slug" className="text-xs font-medium text-ink">
              Slug (URL Identifier)
            </Label>
            <Input
              id="category-slug"
              placeholder="e.g. data-science"
              {...register("slug")}
              className="text-xs font-mono border-hairline bg-surface text-ink focus-visible:ring-notion-blue placeholder:text-ink-muted"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="category-desc" className="text-xs font-medium text-ink">
              Description
            </Label>
            <Textarea
              id="category-desc"
              rows={3}
              placeholder="Optional overview of subjects covered under this category..."
              {...register("description")}
              className="text-xs border-hairline bg-surface text-ink focus-visible:ring-notion-blue placeholder:text-ink-muted resize-none"
            />
          </div>

          {/* Is Active Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="category-active"
              {...register("isActive")}
              className="h-4 w-4 rounded border-hairline text-notion-blue focus:ring-notion-blue"
            />
            <Label htmlFor="category-active" className="text-xs font-medium text-ink cursor-pointer">
              Active and visible in course creation dropdowns
            </Label>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs font-medium border-hairline text-ink hover:bg-canvas-soft"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-notion-blue hover:bg-notion-blue-hover text-white text-xs font-medium"
            >
              {isSubmitting ? "Saving..." : "Save Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
