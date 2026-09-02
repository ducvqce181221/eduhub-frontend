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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { getPresignedUrl, uploadDirectToR2 } from "@/lib/api/upload";
import type { LessonVideo, UpsertVideoPayload } from "@/types/api";

interface VideoUploaderProps {
  currentVideo?: LessonVideo | null;
  onSaveVideo: (data: UpsertVideoPayload) => Promise<void>;
}

export function VideoUploader({ currentVideo, onSaveVideo }: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(
    currentVideo?.videoUrl || null
  );
  const [durationSeconds, setDurationSeconds] = useState<number>(
    currentVideo?.durationSeconds || 0
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSeconds = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("mp4") && !file.type.includes("webm") && !file.name.match(/\.(mp4|webm|mov)$/i)) {
      setErrorMessage("Please select a valid MP4 or WebM video file.");
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);
    setUploadProgress(0);

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

      // Attempt auto-detect duration
      const videoElement = document.createElement("video");
      videoElement.preload = "metadata";
      videoElement.onloadedmetadata = () => {
        if (videoElement.duration && !isNaN(videoElement.duration)) {
          setDurationSeconds(Math.round(videoElement.duration));
        }
      };
      videoElement.src = URL.createObjectURL(file);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload video to Cloudflare R2");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!uploadedUrl || durationSeconds <= 0) {
      setErrorMessage("Please ensure a video is uploaded and duration is greater than 0s (BR-LES-01).");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      await onSaveVideo({
        videoUrl: uploadedUrl,
        durationSeconds,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save video metadata");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-900">
            Lesson Video (Cloudflare R2 Direct Upload)
          </h3>
          <p className="text-xs text-neutral-500">
            Streams via Cloudflare R2 CDN with dynamic watch heartbeat tracking.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Dropzone / Existing Video Preview */}
      {!uploadedUrl && !isUploading && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 p-8 text-center transition-colors hover:border-[#0075de]/50 hover:bg-sky-50/30"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xs">
            <Upload className="h-6 w-6 text-[#0075de]" />
          </div>
          <h4 className="mt-3 text-sm font-semibold text-neutral-900">
            Upload Lesson Video
          </h4>
          <p className="mt-1 text-xs text-neutral-500">
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
      )}

      {/* Live Upload Progress */}
      {isUploading && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#0075de]" />
              Uploading directly to Cloudflare R2...
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="mt-3 h-2" />
        </div>
      )}

      {/* Video Uploaded Info & Controls */}
      {uploadedUrl && !isUploading && (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900">
                    {uploadedUrl.split("/").pop()}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {durationSeconds > 0 ? formatSeconds(durationSeconds) : "Duration required"}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">Ready on R2</span>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-md border-neutral-200 text-xs text-neutral-700 hover:bg-neutral-50"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Replace Video
              </Button>
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

          {/* Duration Config and Save */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <label htmlFor="duration-input" className="text-xs font-semibold text-neutral-700">
                Duration (seconds):
              </label>
              <Input
                id="duration-input"
                type="number"
                min="1"
                value={durationSeconds || ""}
                onChange={(e) => setDurationSeconds(parseInt(e.target.value, 10) || 0)}
                className="h-8 w-28 text-xs"
                placeholder="e.g. 360"
              />
              <span className="text-xs text-neutral-400">
                ({formatSeconds(durationSeconds || 0)})
              </span>
            </div>

            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || durationSeconds <= 0}
              className="rounded-md bg-[#0075de] text-xs font-medium text-white hover:bg-[#005bab]"
            >
              {isSaving ? "Saving..." : "Save Video"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
