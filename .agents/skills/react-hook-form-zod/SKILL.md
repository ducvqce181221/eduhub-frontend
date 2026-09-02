---
name: react-hook-form-zod
description: Best practices, architecture patterns, and conventions for building robust, type-safe forms with React Hook Form, Zod, shadcn/ui Form primitives, OpenAPI type synchronization, presigned media uploads, and NestJS backend integration in EduHub.
---

# React Hook Form + Zod Skill (EduHub Edition)

Comprehensive guidelines, design patterns, and anti-pitfall rules for implementing high-performance, type-safe forms in `eduhub-frontend`. Fully aligned with OpenAPI generated contracts (`api.generated.ts`), the EduHub Design System (Cal.com aesthetic), NestJS API response envelopes, and media upload flows (Cloudinary + Cloudflare R2).

---

## 1. Core Stack & Architecture

- **Form State Manager:** `react-hook-form`
- **Validation Engine:** `zod`
- **Resolver Bridge:** `@hookform/resolvers/zod`
- **Type Contract Source of Truth:** `openapi-typescript` generated types (`api.generated.ts` from `/api/docs-json`)
- **UI Components:** `shadcn/ui` Form primitives (`<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>`, `<FormDescription>`)
- **Server Mutation:** `@tanstack/react-query` (`useMutation`)
- **Media Upload Pipeline:** Cloudinary (`POST /upload/image`) & Cloudflare R2 direct Presigned PUT (`POST /upload/presigned-url`)
- **Feedback & Toasts:** `sonner` (`toast.success`, `toast.error`, `toast.promise`)

---

## 2. OpenAPI Type Contract Synchronization

In EduHub, backend DTOs define the API contracts, which are exported to `types/api.generated.ts` via `openapi-typescript`. Form state is managed via Zod schemas (`z.infer<typeof schema>`).

### Pattern A: 1-to-1 DTO Matching (Compile-time Type Contract)
When the form payload directly mirrors the backend DTO, enforce type compatibility using `satisfies` or `z.ZodType<ExactDto>`:

```tsx
import { z } from "zod";
import type { paths } from "@/types/api.generated";

// Type alias from generated OpenAPI schema
export type CreateCoursePayload =
  paths["/api/v1/courses"]["post"]["requestBody"]["content"]["application/json"];

export const createCourseSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().trim().optional(),
  categoryId: z.string().uuid("Invalid category ID"),
}) satisfies z.ZodType<CreateCoursePayload>;

export type CreateCourseFormData = z.infer<typeof createCourseSchema>;
```

### Pattern B: UI-Extended Forms & Payload Mappers
When the form contains client-only fields (e.g. `confirmPassword`, UI flags, temporary file objects), keep the form schema separate and provide an explicit **Payload Mapper** to output the generated OpenAPI DTO:

```tsx
import { z } from "zod";
import type { paths } from "@/types/api.generated";

export type RegisterUserPayload =
  paths["/api/v1/auth/register"]["post"]["requestBody"]["content"]["application/json"];

export const registerFormSchema = z
  .object({
    email: z.string().trim().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerFormSchema>;

/**
 * Maps client form data to OpenAPI generated request payload
 */
export function toRegisterPayload(data: RegisterFormData): RegisterUserPayload {
  return {
    email: data.email,
    password: data.password,
    fullName: data.fullName,
  };
}
```

---

## 3. Controlled Media Upload Pattern (Presigned R2 & Cloudinary)

In EduHub, media upload fields (Avatar, Thumbnail, Lesson Video, Attachments) do not submit raw `File` objects through the main JSON DTO. Instead:
1. **Images (Thumbnail, Avatar):** Upload directly to Cloudinary (`POST /upload/image`) $\rightarrow$ returns CDN URL $\rightarrow$ stored as `string` in form state.
2. **Videos & Resources:** Mint Presigned URL (`POST /upload/presigned-url`) $\rightarrow$ Direct `PUT` to Cloudflare R2 with progress tracking $\rightarrow$ stored as `string` in form state.

### Reusable Controlled Upload Field Pattern
Encapsulate the dropzone, upload mutation, and progress bar into a controlled component wired to `<FormField>`:

```tsx
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, CheckCircle2, X, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FileUploadFieldProps {
  value?: string;
  onChange: (url: string) => void;
  onUploadStateChange?: (isUploading: boolean) => void;
  accept?: Record<string, string[]>;
  category: "thumbnail" | "video" | "resource" | "avatar";
  maxSizeMB?: number;
}

export function FileUploadField({
  value,
  onChange,
  onUploadStateChange,
  accept,
  category,
  maxSizeMB = 50,
}: FileUploadFieldProps) {
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      onUploadStateChange?.(true);
      setProgress(10);

      if (category === "thumbnail" || category === "avatar") {
        // --- 1. Cloudinary Flow ---
        const formData = new FormData();
        formData.append("file", file);
        const res = await uploadImageApi(formData);
        onChange(res.data.url);
      } else {
        // --- 2. Cloudflare R2 Presigned PUT Flow ---
        const { data: presigned } = await getPresignedUrlApi({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size, // Required by PresignedUrlDto for S3 ContentLength
          folder: category === "video" ? "videos" : "resources", // Exact field name is `folder`
        });

        // Direct PUT to R2 with upload progress callback
        await uploadToR2WithProgress(presigned.uploadUrl, file, (percent) => {
          setProgress(percent);
        });

        // Exact response field from backend R2StorageService is `fileUrl`
        onChange(presigned.fileUrl);
      }

      setProgress(100);
    } catch (err) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      onUploadStateChange?.(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => acceptedFiles[0] && handleUpload(acceptedFiles[0]),
    maxFiles: 1,
    maxSize: maxSizeMB * 1024 * 1024,
    disabled: isUploading,
    accept,
  });

  if (value) {
    return (
      <div className="relative flex items-center justify-between rounded-lg border border-hairline p-3 bg-surface-soft">
        <div className="flex items-center gap-2 truncate">
          <CheckCircle2 className="size-4 text-success shrink-0" />
          <span className="text-sm truncate text-body">{value}</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange("")}
          className="shrink-0 size-7"
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-ink bg-surface-soft" : "border-hairline hover:bg-surface-soft"
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="size-8 mx-auto text-muted mb-2" />
        <p className="text-sm font-medium text-body">
          {isDragActive ? "Drop the file here" : "Click to upload or drag and drop"}
        </p>
        <p className="text-xs text-muted mt-1">Max file size: {maxSizeMB}MB</p>
      </div>

      {isUploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted">
            <span className="flex items-center gap-1">
              <Loader2 className="size-3 animate-spin" /> Uploading...
            </span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}
    </div>
  );
}
```

### Integration in Form with Submission Blocking
Ensure the form submit button is disabled while any media upload is actively in progress:

```tsx
export function CourseMetadataForm() {
  const [isMediaUploading, setIsMediaUploading] = useState(false);
  const form = useForm<CourseMetadataFormData>({ ... });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Course title & metadata fields */}
        
        <FormField
          control={form.control}
          name="thumbnailUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Thumbnail</FormLabel>
              <FormControl>
                <FileUploadField
                  category="thumbnail"
                  value={field.value}
                  onChange={field.onChange}
                  onUploadStateChange={setIsMediaUploading}
                  accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting || isMediaUploading}
          className="w-full"
        >
          {isMediaUploading ? "Uploading media..." : "Save Course"}
        </Button>
      </form>
    </Form>
  );
}
```

---

## 4. Mandatory Form Rules & Conventions

### Rule 1: Explicit and Complete `defaultValues`
**Never omit `defaultValues` or pass `undefined`.** Missing default values cause React's *"changing an uncontrolled input to be controlled"* warning and breaking re-renders.

```tsx
// ✅ Correct: Complete initial state for all fields
const form = useForm<CreateCourseFormData>({
  resolver: zodResolver(createCourseSchema),
  defaultValues: {
    title: "",
    description: "",
    categoryId: "",
  },
  mode: "onBlur", // or "onChange" for live feedback where necessary
});
```

### Rule 2: Native & shadcn/ui Form Composition Pattern
Always use the `<FormField>` pattern with render props. Bind `field` props directly to the control.

```tsx
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CourseForm() {
  const form = useForm<CreateCourseFormData>({ ... });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Fullstack Web Development" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
          {form.formState.isSubmitting ? "Creating..." : "Create Course"}
        </Button>
      </form>
    </Form>
  );
}
```

---

## 5. NestJS Backend Error Envelope Integration

EduHub backend returns errors in the standard envelope:
`{ success: false, statusCode: 400, message: string | string[], error: string }`.

### Backend Error Mapping Helper
Use this pattern to map NestJS `class-validator` messages directly into field-level or root form errors:

```tsx
import { UseFormSetError, FieldValues, Path } from "react-hook-form";
import { toast } from "sonner";

interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string | string[];
  error: string;
}

export function handleFormApiError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldNames: (keyof T)[]
) {
  const apiError = (error as { response?: { data?: ApiErrorResponse } })?.response?.data;
  
  if (!apiError) {
    toast.error("An unexpected error occurred. Please try again.");
    return;
  }

  // Handle Rate Limiting (BR-SEC-01)
  if (apiError.statusCode === 429) {
    toast.error("Too many attempts. Please wait a minute and try again.");
    return;
  }

  const messages = Array.isArray(apiError.message) ? apiError.message : [apiError.message];
  let matchedAnyField = false;

  messages.forEach((msg) => {
    // Attempt to match field name from message (e.g., "email must be an email")
    const matchedField = fieldNames.find((field) =>
      msg.toLowerCase().includes(String(field).toLowerCase())
    );

    if (matchedField) {
      setError(matchedField as Path<T>, { type: "server", message: msg });
      matchedAnyField = true;
    }
  });

  if (!matchedAnyField) {
    // Set root error or display toast
    setError("root" as Path<T>, { type: "server", message: messages[0] });
    toast.error(messages[0] || apiError.error);
  }
}
```

---

## 6. Dynamic Field Arrays (`useFieldArray`)

Essential for **Quiz Builder** (questions & choices) and **Curriculum Resources**.

### Golden Rules for `useFieldArray`:
1. **Always use `key={field.id}`** on the root array element — never use the map index `key={index}`.
2. **Access nested paths via template strings:** `name={`questions.${index}.title`}`.
3. **Always set `type="button"` on non-submit buttons** (Add/Remove) to prevent accidental form submission.

```tsx
import { useFieldArray, useFormContext } from "react-hook-form";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuestionChoicesProps {
  nestIndex: number;
}

export function QuestionChoices({ nestIndex }: QuestionChoicesProps) {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${nestIndex}.choices`,
  });

  return (
    <div className="space-y-2">
      {fields.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          <Input
            {...register(`questions.${nestIndex}.choices.${index}.text` as const)}
            placeholder={`Option ${index + 1}`}
          />
          <Button
            type="button" // CRITICAL: Prevent form submit
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
            disabled={fields.length <= 2} // Business rule: min 2 choices
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ text: "", isCorrect: false })}
        disabled={fields.length >= 6} // Max choices limit
      >
        <Plus className="size-4 mr-1" /> Add Option
      </Button>
    </div>
  );
}
```

---

## 7. Handling Specialized Inputs (Number, Select, Switch, Date)

### Number Inputs with Coercion
Zod must coerce HTML string input values into numbers:

```tsx
export const quizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  passScore: z.coerce
    .number({ invalid_type_error: "Pass score must be a number" })
    .min(0, "Min score is 0")
    .max(100, "Max score is 100"),
});
```

### Select & Dropdown Integration
```tsx
<FormField
  control={form.control}
  name="categoryId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Category</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Checkbox & Switch (Boolean) Integration
```tsx
<FormField
  control={form.control}
  name="isPublished"
  render={({ field }) => (
    <FormItem className="flex items-center justify-between rounded-lg border p-3">
      <div className="space-y-0.5">
        <FormLabel>Publish Course</FormLabel>
        <FormDescription>Make course visible to students</FormDescription>
      </div>
      <FormControl>
        <Switch checked={field.value} onCheckedChange={field.onChange} />
      </FormControl>
    </FormItem>
  )}
/>
```

---

## 8. EduHub Specific Business Rule Checklists

When building forms for EduHub, cross-reference these UX Business Rules:

| Module / Form | Rule ID | Form Requirement |
| :--- | :--- | :--- |
| **Register** | `BR-USR-01` | **No role selector** in public register form. Account is always created as `STUDENT`. |
| **Course Publish** | `BR-CRS-02` | On `422` error, render checklist items with status (✅/❌) rather than generic error toast. |
| **Course Archive** | `BR-CRS-04` | Require explicit confirmation dialog ("This action cannot be undone"). |
| **Quiz Attempts** | `BR-QZ-04` | Submit all answers at once (`POST /quizzes/:id/attempts`). Allow "Retry Quiz" flow. |
| **Auth Forms** | `BR-SEC-01` | Catch `429 Too Many Requests` and display friendly cooldown notification. |

---

## 9. Performance & Optimization Guidelines

1. **Avoid Top-Level `watch()` for Large Forms:**
   - Using `form.watch()` causes the entire form component to re-render on every keystroke.
   - Use `useWatch({ control, name: "fieldName" })` inside targeted child components instead.
2. **Form Resetting:**
   - When resetting form with async data (e.g., editing existing course), use `form.reset(courseData)` inside a `useEffect` or pass `values={courseData}` to `useForm`.
3. **Clean Up Dynamic Fields:**
   - Always ensure `useFieldArray` fields map with `key={item.id}` to preserve DOM state during reordering or deletions.
