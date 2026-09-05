"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  Upload,
  Trash2,
  Download,
  Loader2,
  Plus,
  AlertCircle,
  FolderOpen,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AssetLibraryDialog } from "./asset-library-dialog";
import { ExternalUrlDialog } from "./external-url-dialog";
import { DuplicateAssetDialog } from "./duplicate-asset-dialog";
import { getPresignedUrl, uploadDirectToR2, checkDuplicateAsset } from "@/lib/api/upload";
import { computeFileHash } from "@/lib/utils/hash";
import type { LessonResource, CreateResourcePayload, MediaAsset } from "@/types/api";

interface ResourcesManagerProps {
  resources: LessonResource[];
  onAddResource: (payload: CreateResourcePayload) => Promise<void>;
  onDeleteResource: (resourceId: string) => Promise<void>;
  onAttachFromLibrary?: (assetId: string, customName?: string) => Promise<void>;
}

export function ResourcesManager({
  resources,
  onAddResource,
  onDeleteResource,
  onAttachFromLibrary,
}: ResourcesManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingResource, setDeletingResource] = useState<LessonResource | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isExternalUrlOpen, setIsExternalUrlOpen] = useState(false);
  const [duplicateAsset, setDuplicateAsset] = useState<MediaAsset | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "External Link";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const executeUpload = async (file: File) => {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check for duplicate asset via SHA-256 hash
    try {
      const hash = await computeFileHash(file);
      const dup = await checkDuplicateAsset({
        hash,
        fileSize: file.size,
        mediaType: "DOCUMENT",
      });

      if (dup?.isDuplicate && dup.existingAsset) {
        setDuplicateAsset(dup.existingAsset);
        setPendingFile(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    } catch {
      // If duplicate check endpoint fails or is in unmocked test environment, proceed with direct upload
    }

    await executeUpload(file);
  };

  const handleUseExistingFromDuplicate = async () => {
    if (!duplicateAsset) return;
    try {
      if (onAttachFromLibrary) {
        await onAttachFromLibrary(duplicateAsset.id, pendingFile?.name);
      } else {
        await onAddResource({
          name: pendingFile?.name || duplicateAsset.name,
          fileUrl: duplicateAsset.fileUrl,
          fileType: duplicateAsset.fileType,
          fileSize: duplicateAsset.fileSize,
          isExternal: duplicateAsset.source === "EXTERNAL_URL",
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to attach existing asset");
    } finally {
      setDuplicateAsset(null);
      setPendingFile(null);
    }
  };

  const handleUploadAnywayFromDuplicate = async () => {
    if (pendingFile) {
      const file = pendingFile;
      setDuplicateAsset(null);
      setPendingFile(null);
      await executeUpload(file);
    }
  };

  const handleSelectFromLibrary = async (asset: MediaAsset, customTitle?: string) => {
    if (onAttachFromLibrary) {
      await onAttachFromLibrary(asset.id, customTitle);
    } else {
      await onAddResource({
        name: customTitle || asset.name,
        fileUrl: asset.fileUrl,
        fileType: asset.fileType,
        fileSize: asset.fileSize,
        isExternal: asset.source === "EXTERNAL_URL",
      });
    }
  };

  const handleAddExternal = async (asset: MediaAsset) => {
    if (onAttachFromLibrary) {
      await onAttachFromLibrary(asset.id);
    } else {
      await onAddResource({
        name: asset.name,
        fileUrl: asset.fileUrl,
        fileType: asset.fileType,
        fileSize: asset.fileSize,
        isExternal: true,
      });
    }
  };

  return (
    <>
      <div className="space-y-4 rounded-lg border border-hairline bg-surface p-5 shadow-notion-soft">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-ink">
              Downloadable Resources ({resources.length})
            </h3>
            <p className="text-xs text-ink-muted">
              Attach source code, cheat sheets, PDF guides, or external documentation links.
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md bg-notion-blue text-xs font-semibold text-white hover:bg-notion-blue-active shadow-2xs"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  Upload File
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => setIsLibraryOpen(true)}
              className="rounded-md border-hairline text-xs font-semibold text-ink hover:bg-canvas-soft"
            >
              <FolderOpen className="mr-1.5 h-3.5 w-3.5 text-notion-blue" />
              From Library
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => setIsExternalUrlOpen(true)}
              className="rounded-md border-hairline text-xs font-semibold text-ink hover:bg-canvas-soft"
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-ink-muted" />
              Add Link
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-md bg-sticker-red/15 p-3 text-xs text-sticker-red border border-transparent">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Resources list */}
        {resources.length === 0 ? (
          <div className="rounded-md border border-dashed border-hairline py-8 text-center text-xs text-ink-muted">
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-canvas-soft text-ink-muted mb-2">
              <FileText className="h-4 w-4" />
            </div>
            <p className="font-medium text-ink">No resources attached to this lesson yet.</p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Upload a file, choose from your media library, or attach an external URL above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-hairline rounded-md border border-hairline bg-surface">
            {resources.map((res) => (
              <div
                key={res.id}
                className="flex items-center justify-between p-3 transition hover:bg-canvas-soft/60"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {res.isExternal ? (
                    <ExternalLink className="h-4 w-4 shrink-0 text-notion-blue" />
                  ) : (
                    <FileText className="h-4 w-4 shrink-0 text-notion-blue" />
                  )}
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs font-semibold text-ink">
                        {res.name}
                      </p>
                      {res.isExternal && (
                        <Badge variant="secondary" className="text-[10px] font-normal py-0 px-1.5 h-4">
                          External Link
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] font-mono tabular-nums text-ink-muted">
                      {res.isExternal ? "External resource" : formatFileSize(res.fileSize)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-ink-muted hover:text-ink hover:bg-canvas-soft"
                    title={res.isExternal ? "Open external link" : "Download resource"}
                  >
                    <a
                      href={res.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={res.isExternal ? undefined : res.name}
                    >
                      {res.isExternal ? (
                        <ExternalLink className="h-3.5 w-3.5" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingResource(res)}
                    className="h-7 w-7 text-ink-muted hover:text-sticker-red hover:bg-canvas-soft"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Select from Library Dialog */}
      <AssetLibraryDialog
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        mediaType="DOCUMENT"
        onSelectAsset={handleSelectFromLibrary}
      />

      {/* Add External URL Dialog */}
      <ExternalUrlDialog
        isOpen={isExternalUrlOpen}
        onClose={() => setIsExternalUrlOpen(false)}
        mediaType="DOCUMENT"
        onAddExternal={handleAddExternal}
      />

      {/* Duplicate Detection Prompt Dialog */}
      <DuplicateAssetDialog
        isOpen={!!duplicateAsset}
        onClose={() => {
          setDuplicateAsset(null);
          setPendingFile(null);
        }}
        existingAsset={duplicateAsset}
        newFileName={pendingFile?.name || ""}
        onUseExisting={handleUseExistingFromDuplicate}
        onUploadAnyway={handleUploadAnywayFromDuplicate}
      />

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
