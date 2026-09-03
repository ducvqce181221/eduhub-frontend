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
    watch,
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
      <DialogContent className="sm:max-w-md rounded-xl bg-white p-6 shadow-xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-bold text-neutral-900">
            {isEdit ? "Edit Category" : "Create Category"}
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500">
            {isEdit
              ? "Update course category details and active availability."
              : "Create a new topic category for platform course classification."}
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <div className="rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          {/* Category Name */}
          <div className="space-y-1.5">
            <Label htmlFor="category-name" className="text-xs font-semibold text-neutral-700">
              Category Name
            </Label>
            <Input
              id="category-name"
              placeholder="e.g. Data Science"
              {...register("name")}
              onChange={handleNameChange}
              className="text-xs border-neutral-200 focus-visible:ring-[#0075de]"
            />
            {errors.name && (
              <p className="text-[11px] font-medium text-rose-600">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="category-slug" className="text-xs font-semibold text-neutral-700">
              Slug (URL Identifier)
            </Label>
            <Input
              id="category-slug"
              placeholder="e.g. data-science"
              {...register("slug")}
              className="text-xs font-mono border-neutral-200 focus-visible:ring-[#0075de]"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="category-desc" className="text-xs font-semibold text-neutral-700">
              Description
            </Label>
            <Textarea
              id="category-desc"
              rows={3}
              placeholder="Optional overview of subjects covered under this category..."
              {...register("description")}
              className="text-xs border-neutral-200 focus-visible:ring-[#0075de]"
            />
          </div>

          {/* Is Active Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="category-active"
              {...register("isActive")}
              className="h-4 w-4 rounded border-neutral-300 text-[#0075de] focus:ring-[#0075de]"
            />
            <Label htmlFor="category-active" className="text-xs font-medium text-neutral-700 cursor-pointer">
              Active and visible in course creation dropdowns
            </Label>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs font-medium border-neutral-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0075de] hover:bg-[#005bab] text-white text-xs font-medium"
            >
              {isSubmitting ? "Saving..." : "Save Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
