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
import { Input } from "@/components/ui/input";
import { AlertCircle, Globe, Loader2 } from "lucide-react";
import { createExternalAsset } from "@/lib/api/media-assets";
import { useTranslation } from "@/lib/i18n/language-context";
import type { MediaAsset, MediaType } from "@/types/api";

interface ExternalUrlDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: MediaType;
  onAddExternal: (asset: MediaAsset) => Promise<void>;
}

export function ExternalUrlDialog({
  isOpen,
  onClose,
  mediaType,
  onAddExternal,
}: ExternalUrlDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [durationSeconds, setDurationSeconds] = useState<number | "">("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) {
      setErrorMessage("Please fill in both the display name and URL.");
      return;
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setErrorMessage("URL must start with http:// or https://");
      return;
    }

    if (mediaType === "VIDEO" && (!durationSeconds || Number(durationSeconds) <= 0)) {
      setErrorMessage("Video duration (in seconds) is required for lesson publication.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      // 1. Create external asset (backend validates scheme, SSRF, and reachability)
      const asset = await createExternalAsset({
        name: name.trim(),
        url: url.trim(),
        mediaType,
        durationSeconds: durationSeconds ? Number(durationSeconds) : undefined,
      });

      // 2. Attach to lesson
      await onAddExternal(asset);

      // Reset and close
      setName("");
      setUrl("");
      setDurationSeconds("");
      onClose();
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          "Failed to verify external URL. Please verify the link is publicly accessible.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setErrorMessage(null);
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md bg-surface border-hairline shadow-notion-elevated">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-notion-blue/10 text-notion-blue shrink-0">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-ink">
                {t.uploader.addExternalTitle.replace("{type}", mediaType === "VIDEO" ? t.uploader.videoUrl : t.uploader.resourceLink)}
              </DialogTitle>
              <DialogDescription className="text-xs text-ink-muted mt-0.5">
                {t.uploader.addExternalDesc}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMessage && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              {t.uploader.displayNameLabel} <span className="text-destructive">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                mediaType === "VIDEO"
                  ? "e.g. System Architecture Stream"
                  : "e.g. Official Documentation Guide"
              }
              className="text-xs bg-surface border-hairline"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              {t.uploader.externalUrlLabel} <span className="text-destructive">*</span>
            </label>
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/resource"
              className="text-xs bg-surface border-hairline font-mono"
              required
            />
            <p className="text-[11px] text-ink-muted mt-1">
              {t.uploader.urlReachabilityHint}
            </p>
          </div>

          {mediaType === "VIDEO" && (
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                {t.uploader.videoDurationLabel} <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                min="1"
                value={durationSeconds}
                onChange={(e) =>
                  setDurationSeconds(e.target.value ? parseInt(e.target.value, 10) : "")
                }
                placeholder="e.g. 360"
                className="text-xs bg-surface border-hairline font-mono"
                required
              />
            </div>
          )}

          <DialogFooter className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isVerifying}
              className="rounded-full border-hairline text-xs font-medium text-ink hover:bg-canvas-soft px-4"
            >
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              disabled={isVerifying || !name.trim() || !url.trim()}
              className="rounded-full bg-notion-blue hover:bg-notion-blue-hover text-white text-xs font-medium px-4 shadow-notion-soft"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  {t.uploader.verifyingLink}
                </>
              ) : (
                t.uploader.verifyAndAttach
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
