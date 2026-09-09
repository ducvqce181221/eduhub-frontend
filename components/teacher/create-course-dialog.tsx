import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Category, CourseLevel, CreateCoursePayload } from "@/types/api";

const createCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  categoryId: z.string().min(1, "Please select a category"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  description: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof createCourseSchema>;

interface CreateCourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCoursePayload) => Promise<void>;
  categories: Category[];
}

export function CreateCourseDialog({
  isOpen,
  onClose,
  onSubmit,
  categories,
}: CreateCourseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: "",
      categoryId: categories[0]?.id || "",
      level: "BEGINNER",
      description: "",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        title: values.title.trim(),
        categoryId: values.categoryId,
        level: values.level,
        description: values.description?.trim() || undefined,
      });
      form.reset();
      onClose();
    } catch (error) {
      // Error handled by parent / toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-lg border border-hairline bg-surface p-6 shadow-notion-elevated">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-ink tracking-tight">
            Create New Course
          </DialogTitle>
          <DialogDescription className="text-xs text-ink-muted leading-relaxed">
            Give your course a title and choose its initial level and category. You can add chapters and lessons in the Course Builder.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="course-title-input" className="text-xs font-semibold text-ink">Course Title</FormLabel>
                  <FormControl>
                    <Input
                      id="course-title-input"
                      placeholder="e.g. Master NestJS and Microservices"
                      className="text-xs bg-surface border-hairline"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-ink">Category</FormLabel>
                    <FormControl>
                      <select
                        aria-label="Category"
                        className="flex h-9 w-full rounded-md border border-hairline bg-surface px-3 py-1 text-xs text-ink shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-notion-blue focus-visible:border-notion-blue [&>option]:bg-surface [&>option]:text-ink"
                        {...field}
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-ink">Target Level</FormLabel>
                    <FormControl>
                      <select
                        aria-label="Target Level"
                        className="flex h-9 w-full rounded-md border border-hairline bg-surface px-3 py-1 text-xs text-ink shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-notion-blue focus-visible:border-notion-blue [&>option]:bg-surface [&>option]:text-ink"
                        {...field}
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-ink">Brief Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Summarize what learners will achieve..."
                      className="resize-none text-xs bg-surface border-hairline"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6 flex gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-full border-hairline text-xs font-medium text-ink-secondary hover:bg-canvas-soft px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-notion-blue text-xs font-semibold text-white hover:bg-notion-blue-hover shadow-notion-soft px-4"
              >
                {isSubmitting ? "Creating..." : "Create Course"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
