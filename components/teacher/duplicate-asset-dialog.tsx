"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyCheck, FileText, Video, ExternalLink, Calendar, HardDrive } from "lucide-react";
import type { MediaAsset } from "@/types/api";

interface DuplicateAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingAsset: MediaAsset | null;
  newFileName: string;
  onUseExisting: () => void;
  onUploadAnyway: () => void;
}

export function DuplicateAssetDialog({
  isOpen,
  onClose,
  existingAsset,
  newFileName,
  onUseExisting,
  onUploadAnyway,
}: DuplicateAssetDialogProps) {
  if (!existingAsset) return null;

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isVideo = existingAsset.mediaType === "VIDEO";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-surface border-hairline shadow-notion-elevated">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
              <CopyCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-ink">
                Duplicate File Detected
              </DialogTitle>
              <DialogDescription className="text-xs text-ink-muted mt-0.5">
                Identical file content (SHA-256 match) was found in your library.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Existing Asset Card Preview */}
        <div className="rounded-lg border border-hairline bg-canvas-soft/60 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {isVideo ? (
                <Video className="h-5 w-5 text-notion-blue shrink-0" />
              ) : (
                <FileText className="h-5 w-5 text-notion-blue shrink-0" />
              )}
              <div className="truncate">
                <p className="text-xs font-semibold text-ink truncate">
                  {existingAsset.name}
                </p>
                <p className="text-[11px] text-ink-muted truncate font-mono">
                  Incoming: {newFileName}
                </p>
              </div>
            </div>

            <Badge variant="secondary" className="text-[10px] font-medium shrink-0">
              {existingAsset.source === "EXTERNAL_URL" ? "External" : "R2 Storage"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-hairline/80 text-[11px] text-ink-secondary">
            <div className="flex items-center gap-1.5 font-mono tabular-nums">
              <HardDrive className="h-3.5 w-3.5 text-ink-muted shrink-0" />
              <span>{formatFileSize(existingAsset.fileSize)}</span>
            </div>
            {existingAsset.createdAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-ink-muted shrink-0" />
                <span>{new Date(existingAsset.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-ink-secondary leading-relaxed">
          Reusing the existing file saves storage and attaches immediately without waiting for re-upload.
        </p>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-full border-hairline text-xs font-medium text-ink hover:bg-canvas-soft px-4"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onClose();
              onUploadAnyway();
            }}
            className="rounded-full border-hairline text-xs font-medium text-ink hover:bg-canvas-soft px-4"
          >
            Upload Anyway
          </Button>
          <Button
            type="button"
            onClick={() => {
              onClose();
              onUseExisting();
            }}
            className="rounded-full bg-notion-blue hover:bg-notion-blue-hover text-white text-xs font-medium px-4 shadow-notion-soft"
          >
            Use Existing Asset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
