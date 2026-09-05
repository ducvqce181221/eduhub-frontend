"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Video,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Clock,
  FolderOpen,
  ExternalLink,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AssetLibraryDialog } from "./asset-library-dialog";
import { ExternalUrlDialog } from "./external-url-dialog";
import { DuplicateAssetDialog } from "./duplicate-asset-dialog";
import { getPresignedUrl, uploadDirectToR2, checkDuplicateAsset } from "@/lib/api/upload";
import { computeFileHash } from "@/lib/utils/hash";
import type { LessonVideo, UpsertVideoPayload, MediaAsset } from "@/types/api";

interface VideoUploaderProps {
  currentVideo?: LessonVideo | null;
  onSaveVideo: (data: UpsertVideoPayload) => Promise<void>;
  onAttachFromLibrary?: (assetId: string, customTitle?: string) => Promise<void>;
}

export function VideoUploader({
  currentVideo,
  onSaveVideo,
  onAttachFromLibrary,
}: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(
    currentVideo?.videoUrl || null
  );
  const [durationSeconds, setDurationSeconds] = useState<number>(
    currentVideo?.durationSeconds || 0
  );
  const [videoTitle, setVideoTitle] = useState<string>(
    currentVideo?.title || ""
  );
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(
    currentVideo?.assetId || null
  );
  const [isExternal, setIsExternal] = useState<boolean>(
    !!currentVideo?.isExternal
  );

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isExternalUrlOpen, setIsExternalUrlOpen] = useState(false);
  const [duplicateAsset, setDuplicateAsset] = useState<MediaAsset | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSeconds = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  };

  const executeVideoUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);

    try {
      // 1. Get presigned URL for Cloudflare R2
      const presigned = await getPresignedUrl({
        fileName: file.name,
        fileType: file.type || "video/mp4",
        folder: "videos",
      });

      // 2. Direct binary upload to R2
      await uploadDirectToR2(presigned.uploadUrl, file, (progress) => {
        setUploadProgress(progress);
      });

      setUploadedUrl(presigned.fileUrl);
      setSelectedAssetId(null);
      setIsExternal(false);

      // Attempt auto-detect duration
      if (typeof document !== "undefined") {
        const videoElement = document.createElement("video");
        videoElement.preload = "metadata";
        videoElement.onloadedmetadata = () => {
          if (videoElement.duration && !isNaN(videoElement.duration)) {
            setDurationSeconds(Math.round(videoElement.duration));
          }
        };
        videoElement.src = URL.createObjectURL(file);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload video to Cloudflare R2");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !file.type.includes("mp4") &&
      !file.type.includes("webm") &&
      !file.name.match(/\.(mp4|webm|mov)$/i)
    ) {
      setErrorMessage("Please select a valid MP4 or WebM video file.");
      return;
    }

    setErrorMessage(null);

    // Duplicate detection check
    try {
      const hash = await computeFileHash(file);
      const dup = await checkDuplicateAsset({
        hash,
        fileSize: file.size,
        mediaType: "VIDEO",
      });

      if (dup?.isDuplicate && dup.existingAsset) {
        setDuplicateAsset(dup.existingAsset);
        setPendingFile(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    } catch {
      // If duplicate check fails or unmocked in tests, proceed with upload
    }

    await executeVideoUpload(file);
  };

  const handleUseExistingFromDuplicate = () => {
    if (!duplicateAsset) return;
    setUploadedUrl(duplicateAsset.fileUrl);
    setDurationSeconds(duplicateAsset.durationSeconds || 0);
    setVideoTitle(duplicateAsset.name);
    setSelectedAssetId(duplicateAsset.id);
    setIsExternal(duplicateAsset.source === "EXTERNAL_URL");
    setDuplicateAsset(null);
    setPendingFile(null);
  };

  const handleUploadAnywayFromDuplicate = async () => {
    if (pendingFile) {
      const file = pendingFile;
      setDuplicateAsset(null);
      setPendingFile(null);
      await executeVideoUpload(file);
    }
  };

  const handleSelectFromLibrary = async (asset: MediaAsset, customTitle?: string) => {
    setUploadedUrl(asset.fileUrl);
    setDurationSeconds(asset.durationSeconds || 0);
    setVideoTitle(customTitle || asset.name);
    setSelectedAssetId(asset.id);
    setIsExternal(asset.source === "EXTERNAL_URL");
  };

  const handleAddExternal = async (asset: MediaAsset) => {
    setUploadedUrl(asset.fileUrl);
    setDurationSeconds(asset.durationSeconds || 0);
    setVideoTitle(asset.name);
    setSelectedAssetId(asset.id);
    setIsExternal(true);
  };

  const handleSave = async () => {
    if (!uploadedUrl || durationSeconds <= 0) {
      setErrorMessage(
        "Please ensure a video is uploaded and duration is greater than 0s (BR-LES-01)."
      );
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      if (selectedAssetId && onAttachFromLibrary) {
        await onAttachFromLibrary(selectedAssetId, videoTitle.trim() || undefined);
      } else {
        const payload: UpsertVideoPayload = {
          videoUrl: uploadedUrl,
          durationSeconds,
        };
        if (videoTitle.trim()) {
          payload.title = videoTitle.trim();
        }
        if (selectedAssetId) {
          payload.assetId = selectedAssetId;
        }
        await onSaveVideo(payload);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save video metadata");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-4 rounded-lg border border-hairline bg-surface p-5 shadow-notion-soft">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-ink">
              Lesson Video
            </h3>
            <p className="text-xs text-ink-muted">
              Upload directly to R2, select from your media library, or embed an external URL stream.
            </p>
          </div>

          {!uploadedUrl && !isUploading && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
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
                onClick={() => setIsExternalUrlOpen(true)}
                className="rounded-md border-hairline text-xs font-semibold text-ink hover:bg-canvas-soft"
              >
                <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-ink-muted" />
                External URL
              </Button>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-md bg-sticker-red/15 p-3 text-xs text-sticker-red border border-transparent">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Upload Dropzone */}
        {!uploadedUrl && !isUploading && (
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-hairline bg-canvas-soft/40 p-8 text-center transition-colors hover:border-notion-blue hover:bg-notion-blue/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-hairline shadow-2xs text-notion-blue">
                <Upload className="h-6 w-6" />
              </div>
              <h4 className="mt-3 text-sm font-semibold text-ink">
                Upload Lesson Video
              </h4>
              <p className="mt-1 text-xs text-ink-muted">
                Drag and drop MP4 or WebM video file, or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/*"
                data-testid="video-file-input"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Live Upload Progress */}
        {isUploading && (
          <div className="rounded-lg border border-hairline bg-canvas-soft/60 p-6">
            <div className="flex items-center justify-between text-xs font-semibold text-ink">
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-notion-blue" />
                Uploading directly to Cloudflare R2...
              </span>
              <span className="tabular-nums font-mono">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="mt-3 h-1.5" />
          </div>
        )}

        {/* Video Uploaded Info & Controls */}
        {uploadedUrl && !isUploading && (
          <div className="space-y-4">
            <div className="rounded-lg border border-sticker-teal/25 bg-sticker-teal/5 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sticker-teal/15 text-sticker-teal shrink-0">
                    {isExternal ? (
                      <Globe className="h-5 w-5" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5" />
                    )}
                  </div>
                  <div className="truncate">
                    <h4 className="text-sm font-semibold text-ink truncate">
                      {videoTitle || uploadedUrl.split("/").pop()}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-ink-muted mt-0.5">
                      <span className="flex items-center gap-1 font-mono tabular-nums">
                        <Clock className="h-3 w-3" />
                        {durationSeconds > 0
                          ? formatSeconds(durationSeconds)
                          : "Duration required"}
                      </span>
                      <span>•</span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-normal py-0 px-1.5 h-4"
                      >
                        {isExternal
                          ? "External URL"
                          : selectedAssetId
                          ? "From Library"
                          : "Ready on R2"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-md border-hairline text-xs text-ink hover:bg-canvas-soft"
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Replace Video
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsLibraryOpen(true)}
                    className="rounded-md text-xs text-ink-muted hover:text-ink hover:bg-canvas-soft"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExternalUrlOpen(true)}
                    className="rounded-md text-xs text-ink-muted hover:text-ink hover:bg-canvas-soft"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/*"
                data-testid="video-file-input"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Duration Config, Title, and Save */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="duration-input"
                    className="text-xs font-semibold text-ink"
                  >
                    Duration (seconds):
                  </label>
                  <Input
                    id="duration-input"
                    type="number"
                    min="1"
                    value={durationSeconds || ""}
                    onChange={(e) =>
                      setDurationSeconds(parseInt(e.target.value, 10) || 0)
                    }
                    className="h-8 w-28 text-xs bg-surface border-hairline font-mono tabular-nums"
                    placeholder="e.g. 360"
                  />
                  <span className="text-xs text-ink-muted font-mono tabular-nums">
                    ({formatSeconds(durationSeconds || 0)})
                  </span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving || durationSeconds <= 0}
                className="rounded-md bg-notion-blue text-xs font-semibold text-white hover:bg-notion-blue-active shadow-2xs"
              >
                {isSaving ? "Saving..." : "Save Video"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Select from Library Dialog */}
      <AssetLibraryDialog
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        mediaType="VIDEO"
        onSelectAsset={handleSelectFromLibrary}
      />

      {/* Add External Video Dialog */}
      <ExternalUrlDialog
        isOpen={isExternalUrlOpen}
        onClose={() => setIsExternalUrlOpen(false)}
        mediaType="VIDEO"
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
    </>
  );
}
