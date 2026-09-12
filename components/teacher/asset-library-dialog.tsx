"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  FileText,
  Video,
  Clock,
  HardDrive,
  Check,
  ExternalLink,
  FolderOpen,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { getMediaAssets } from "@/lib/api/media-assets";
import { useTranslation } from "@/lib/i18n/language-context";
import { formatShortDate } from "@/lib/i18n/formatters";
import type { MediaAsset, MediaType, AssetSource } from "@/types/api";

interface AssetLibraryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: MediaType;
  onSelectAsset: (asset: MediaAsset, customTitle?: string) => Promise<void>;
}

export function AssetLibraryDialog({
  isOpen,
  onClose,
  mediaType,
  onSelectAsset,
}: AssetLibraryDialogProps) {
  const { language, t } = useTranslation();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<AssetSource | "ALL">("ALL");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
      setSelectedAsset(null);
      setCustomTitle("");
      setErrorMessage(null);
    }
  }, [isOpen, mediaType, sourceFilter]);

  const fetchAssets = async (searchOverride?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const q = searchOverride !== undefined ? searchOverride : searchQuery;
      const res = await getMediaAssets({
        mediaType,
        source: sourceFilter === "ALL" ? undefined : sourceFilter,
        search: q.trim() || undefined,
        limit: 50,
      });
      setAssets(res.items || []);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load media assets from library");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAssets();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return t.uploader.externalLink;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (totalSeconds?: number | null) => {
    if (!totalSeconds) return "";
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  };

  const handleAttach = async () => {
    if (!selectedAsset) return;
    setIsSubmitting(true);
    try {
      await onSelectAsset(selectedAsset, customTitle.trim() || undefined);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to attach asset to lesson");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0 bg-surface border-hairline shadow-notion-elevated overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-hairline shrink-0">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-ink">
              {t.uploader.assetLibraryTitle}
            </DialogTitle>
            <DialogDescription className="text-xs text-ink-muted">
              {t.uploader.assetLibraryDesc}
            </DialogDescription>
          </DialogHeader>

          {/* Search and Filters */}
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-2.5">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-muted" />
              <Input
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={t.uploader.searchAssetsPlaceholder}
                className="pl-8 pr-8 text-xs bg-surface border-hairline h-8"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    fetchAssets("");
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </form>

            <div className="flex items-center gap-1 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setSourceFilter("ALL")}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                  sourceFilter === "ALL"
                    ? "bg-notion-blue text-white shadow-2xs"
                    : "bg-canvas-soft text-ink-secondary hover:bg-canvas-soft/80 border border-hairline"
                }`}
              >
                {t.uploader.allSources}
              </button>
              <button
                type="button"
                onClick={() => setSourceFilter("R2_UPLOAD")}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                  sourceFilter === "R2_UPLOAD"
                    ? "bg-notion-blue text-white shadow-2xs"
                    : "bg-canvas-soft text-ink-secondary hover:bg-canvas-soft/80 border border-hairline"
                }`}
              >
                {t.uploader.r2Storage}
              </button>
              <button
                type="button"
                onClick={() => setSourceFilter("EXTERNAL_URL")}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                  sourceFilter === "EXTERNAL_URL"
                    ? "bg-notion-blue text-white shadow-2xs"
                    : "bg-canvas-soft text-ink-secondary hover:bg-canvas-soft/80 border border-hairline"
                }`}
              >
                {t.uploader.externalUrls}
              </button>
            </div>
          </div>
        </div>

        {/* Assets List Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2 min-h-[220px]">
          {errorMessage ? (
            <div className="py-8 text-center rounded-lg border border-dashed border-destructive/30 bg-destructive/5 p-6">
              <AlertCircle className="mx-auto h-7 w-7 text-destructive mb-2" />
              <h4 className="text-xs font-semibold text-destructive">{t.common.error}</h4>
              <p className="text-[11px] text-ink-muted mt-1 max-w-sm mx-auto">{errorMessage}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fetchAssets()}
                className="mt-3 text-xs border-hairline"
              >
                {t.common.retry}
              </Button>
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-md" />
              <Skeleton className="h-14 w-full rounded-md" />
              <Skeleton className="h-14 w-full rounded-md" />
            </div>
          ) : assets.length === 0 ? (
            <div className="py-12 text-center rounded-lg border border-dashed border-hairline">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-canvas-soft text-ink-muted mb-2">
                <FolderOpen className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-semibold text-ink">{t.uploader.noAssetsFound}</h4>
              <p className="text-[11px] text-ink-muted mt-0.5 max-w-sm mx-auto">
                {t.uploader.noAssetsFoundDesc.replace("{mediaType}", mediaType === "VIDEO" ? t.uploader.videoType : t.uploader.docType)}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {assets.map((asset) => {
                const isSelected = selectedAsset?.id === asset.id;
                return (
                  <div
                    key={asset.id}
                    onClick={() => {
                      setSelectedAsset(asset);
                      setCustomTitle(asset.name);
                    }}
                    className={`group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "border-notion-blue bg-notion-blue/5 shadow-2xs"
                        : "border-hairline bg-surface hover:bg-canvas-soft/70"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-md shrink-0 transition-colors ${
                          isSelected
                            ? "bg-notion-blue text-white"
                            : "bg-canvas-soft text-ink-muted group-hover:text-notion-blue"
                        }`}
                      >
                        {asset.mediaType === "VIDEO" ? (
                          <Video className="h-4 w-4" />
                        ) : asset.source === "EXTERNAL_URL" ? (
                          <ExternalLink className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </div>

                      <div className="truncate">
                        <p className="text-xs font-semibold text-ink truncate">
                          {asset.name}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-ink-muted font-mono mt-0.5">
                          {asset.durationSeconds && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(asset.durationSeconds)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <HardDrive className="h-3 w-3" />
                            {formatFileSize(asset.fileSize)}
                          </span>
                          <span>•</span>
                          <span>{formatShortDate(asset.createdAt, language)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {asset.usageCount !== undefined && asset.usageCount > 0 && (
                        <span className="text-[10px] text-ink-muted font-mono">
                          {asset.usageCount === 1 ? t.uploader.usedInOneLesson : t.uploader.usedInLessons.replace("{count}", String(asset.usageCount))}
                        </span>
                      )}

                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                          isSelected
                            ? "border-notion-blue bg-notion-blue text-white"
                            : "border-hairline bg-surface"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Asset Details & Action Footer */}
        {selectedAsset && (
          <div className="p-4 bg-canvas-soft/40 border-t border-hairline flex flex-col gap-2 shrink-0">
            <label className="block text-[11px] font-semibold text-ink">
              {t.uploader.displayTitleOptional}
            </label>
            <Input
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder={t.uploader.displayTitlePlaceholder}
              className="h-8 text-xs bg-surface border-hairline"
            />
          </div>
        )}

        {/* Action Footer without negative margins */}
        <div className="p-4 border-t border-hairline bg-surface flex items-center justify-end gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-ink-muted hover:text-ink"
          >
            {t.common.cancel}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!selectedAsset || isSubmitting}
            onClick={handleAttach}
            className="bg-notion-blue text-white text-xs font-semibold hover:bg-notion-blue-active shadow-2xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                {t.uploader.attaching}
              </>
            ) : (
              t.uploader.attachToLesson
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
