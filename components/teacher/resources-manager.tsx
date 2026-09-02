import React, { useState, useRef } from "react";
import {
  FileText,
  Upload,
  Trash2,
  Download,
  Loader2,
  Plus,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getPresignedUrl, uploadDirectToR2 } from "@/lib/api/upload";
import type { LessonResource, CreateResourcePayload } from "@/types/api";

interface ResourcesManagerProps {
  resources: LessonResource[];
  onAddResource: (payload: CreateResourcePayload) => Promise<void>;
  onDeleteResource: (resourceId: string) => Promise<void>;
}

export function ResourcesManager({
  resources,
  onAddResource,
  onDeleteResource,
}: ResourcesManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingResource, setDeletingResource] = useState<LessonResource | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      // 1. Get presigned upload URL for resources folder
      const presigned = await getPresignedUrl({
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        folder: "resources",
      });

      // 2. Direct binary upload to Cloudflare R2
      await uploadDirectToR2(presigned.uploadUrl, file);

      // 3. Save resource record to backend
      await onAddResource({
        name: file.name,
        fileUrl: presigned.fileUrl,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload resource attachment");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Downloadable Resources ({resources.length})
            </h3>
            <p className="text-xs text-neutral-500">
              Attach source code, cheat sheets, PDF guides, or slides.
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md bg-[#0075de] text-xs text-white hover:bg-[#005bab]"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add File
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Resources list */}
        {resources.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-200 py-6 text-center text-xs text-neutral-400">
            No resources attached to this lesson yet.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-neutral-50/40">
            {resources.map((res) => (
              <div
                key={res.id}
                className="flex items-center justify-between p-3 transition hover:bg-white"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="h-4 w-4 shrink-0 text-[#0075de]" />
                  <div className="truncate">
                    <p className="truncate text-xs font-semibold text-neutral-900">
                      {res.name}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      {formatFileSize(res.fileSize)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-neutral-500 hover:text-neutral-900"
                  >
                    <a href={res.fileUrl} target="_blank" rel="noopener noreferrer" download>
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingResource(res)}
                    className="h-7 w-7 text-neutral-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Resource Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingResource}
        onOpenChange={(open) => !open && setDeletingResource(null)}
        variant="danger"
        title="Delete Resource File?"
        confirmLabel="Delete File"
        description={
          <>
            Are you sure you want to remove <strong>&quot;{deletingResource?.name}&quot;</strong> from this lesson?
          </>
        }
        onConfirm={async () => {
          if (deletingResource) {
            const id = deletingResource.id;
            setDeletingResource(null);
            await onDeleteResource(id);
          }
        }}
      />
    </>
  );
}
