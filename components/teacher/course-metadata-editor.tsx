import React, { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Loader2,
  Check,
} from "lucide-react";
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
import { uploadImage } from "@/lib/api/upload";
import type { Category, Course, CourseLevel, UpdateCoursePayload } from "@/types/api";

const metadataSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  categoryId: z.string().min(1, "Please select a category"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  description: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof metadataSchema>;

interface CourseMetadataEditorProps {
  course: Course;
  categories: Category[];
  onSave: (data: UpdateCoursePayload) => Promise<void>;
}

export function CourseMetadataEditor({
  course,
  categories,
  onSave,
}: CourseMetadataEditorProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(course.thumbnailUrl || null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(metadataSchema),
    defaultValues: {
      title: course.title,
      categoryId: course.categoryId,
      level: course.level,
      description: course.description || "",
    },
  });

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const res = await uploadImage(file);
      const imageUrl = res.secureUrl || res.url;
      setThumbnailUrl(imageUrl);
      await onSave({ thumbnailUrl: imageUrl });
    } catch (err) {
      // Error handled
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    setThumbnailUrl(null);
    await onSave({ thumbnailUrl: "" });
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSaving(true);
      await onSave({
        title: values.title.trim(),
        categoryId: values.categoryId,
        level: values.level,
        description: values.description?.trim() || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
      });
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 2000);
    } catch (err) {
      // Error handled
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-hairline bg-surface p-6 shadow-notion-soft">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-ink tracking-tight">
          Course Information & Metadata
        </h2>
        <p className="mt-1 text-xs text-ink-muted">
          Set up the title, category, target level, and cover image displayed in the public catalog.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Thumbnail Uploader */}
          <div>
            <label className="block text-xs font-semibold text-ink">
              Course Thumbnail
            </label>
            <p className="mb-2 text-xs text-ink-muted">
              Recommended: 16:9 ratio (1280x720px, PNG or JPG).
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative aspect-video w-full max-w-70 overflow-hidden rounded-md border border-hairline bg-canvas-soft">
                {thumbnailUrl ? (
                  <>
                    <Image
                      src={thumbnailUrl}
                      alt="Thumbnail preview"
                      fill
                      sizes="280px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white transition hover:bg-black/80 cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-ink-muted">
                    <ImageIcon className="h-8 w-8 stroke-1" />
                    <span className="mt-1 text-xs">No cover image</span>
                  </div>
                )}
              </div>

              <div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-hairline bg-surface px-3 py-2 text-xs font-medium text-ink shadow-2xs hover:bg-canvas-soft transition-colors">
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-muted" />
                      Uploading to Cloudinary...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5 text-notion-blue" />
                      {thumbnailUrl ? "Change Thumbnail" : "Upload Image"}
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    disabled={isUploadingImage}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Master NestJS and Microservices" className="bg-surface border-hairline" {...field} />
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
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <select
                      aria-label="Category"
                      className="flex h-9 w-full rounded-md border border-hairline bg-surface px-3 py-1 text-sm text-ink shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-notion-blue focus-visible:border-notion-blue [&>option]:bg-surface [&>option]:text-ink"
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
                  <FormLabel>Target Level</FormLabel>
                  <FormControl>
                    <select
                      aria-label="Target Level"
                      className="flex h-9 w-full rounded-md border border-hairline bg-surface px-3 py-1 text-sm text-ink shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-notion-blue focus-visible:border-notion-blue [&>option]:bg-surface [&>option]:text-ink"
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
                <FormLabel>Course Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Provide a detailed overview of the curriculum and learning outcomes..."
                    className="resize-none bg-surface border-hairline text-xs"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end gap-3 pt-4">
            {showSavedToast && (
              <span className="flex items-center gap-1 text-xs font-medium text-sticker-teal">
                <Check className="h-3.5 w-3.5" /> Saved successfully
              </span>
            )}
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-notion-blue text-xs font-semibold text-white hover:bg-notion-blue-active shadow-2xs"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
