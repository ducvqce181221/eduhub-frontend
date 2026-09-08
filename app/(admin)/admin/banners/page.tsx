"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Trash2,
  ExternalLink,
  Plus,
  RefreshCw,
  Loader2,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useAllBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useReorderBannersMutation,
} from "@/hooks/use-banners";
import { uploadImage } from "@/lib/api/upload";
import { useTranslation } from "@/lib/i18n/language-context";
import { toast } from "sonner";
import type { Banner } from "@/lib/api/banners";

export default function AdminBannersPage() {
  const { t } = useTranslation();
  const { data: banners = [], isLoading } = useAllBannersQuery();
  const createMutation = useCreateBannerMutation();
  const updateMutation = useUpdateBannerMutation();
  const deleteMutation = useDeleteBannerMutation();
  const reorderMutation = useReorderBannersMutation();

  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Selected file and dimension inspection state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
    ratio: number;
  } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    setSelectedFile(file);
    const blobUrl = URL.createObjectURL(file);
    setPreviewBlobUrl(blobUrl);

    // Measure natural dimensions
    const img = new window.Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const ratio = parseFloat((width / height).toFixed(2));
      setImageDimensions({ width, height, ratio });
    };
    img.src = blobUrl;
  };

  const handleResetForm = () => {
    setIsCreating(false);
    setTitle("");
    setLinkUrl("");
    setIsActive(true);
    setSelectedFile(null);
    if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    setPreviewBlobUrl(null);
    setImageDimensions(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title for the banner");
      return;
    }

    if (!selectedFile) {
      toast.error("Please select an image for the banner");
      return;
    }

    try {
      setIsUploadingImage(true);
      // 1. Upload to Cloudinary
      const uploaded = await uploadImage(selectedFile);
      const imageUrl = uploaded.secureUrl || uploaded.url;

      // 2. Persist banner record
      await createMutation.mutateAsync({
        title: title.trim(),
        imageUrl,
        linkUrl: linkUrl.trim() || undefined,
        isActive,
      });

      handleResetForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to create banner");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleToggleActive = (banner: Banner) => {
    updateMutation.mutate({
      id: banner.id,
      payload: { isActive: !banner.isActive },
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t.banners.deleteConfirm)) {
      deleteMutation.mutate(id);
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const reordered = [...banners];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const payload = {
      orders: reordered.map((b, idx) => ({ id: b.id, order: idx })),
    };
    reorderMutation.mutate(payload);
  };

  const isOptimalRatio =
    imageDimensions &&
    imageDimensions.ratio >= 2.7 &&
    imageDimensions.ratio <= 3.3;

  return (
    <div className="flex flex-col flex-1 bg-canvas-soft min-h-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-notion-blue mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Management</span>
            </div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">
              {t.banners.title}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
              {t.banners.description}
            </p>
          </div>

          {!isCreating && (
            <Button
              onClick={() => setIsCreating(true)}
              variant="pill"
              size="sm"
              className="gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{t.banners.createBanner}</span>
            </Button>
          )}
        </div>

        {/* Create Banner Form Card */}
        {isCreating && (
          <form
            onSubmit={handleSaveBanner}
            className="rounded-xl border border-hairline bg-surface p-6 shadow-notion-soft space-y-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <h2 className="text-base font-bold text-ink">
                {t.banners.createBanner}
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetForm}
                className="text-xs text-ink-muted hover:text-ink"
              >
                {t.common.cancel}
              </Button>
            </div>

            {/* Image Upload Dropzone & Dimension Inspector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                {t.banners.uploadBannerImage}
              </label>
              <p className="text-xs text-ink-muted">
                {t.banners.recommendedSize}
              </p>

              {!previewBlobUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed border-hairline bg-canvas-soft/40 hover:border-notion-blue hover:bg-notion-blue/5 transition-all cursor-pointer text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-surface border border-hairline flex items-center justify-center text-notion-blue mb-3 shadow-2xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-ink">
                    Choose banner image
                  </span>
                  <span className="text-xs text-ink-muted mt-1">
                    PNG, JPG, or WebP up to 5MB
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Dimension Inspection Badge */}
                  {imageDimensions && (
                    <div
                      className={`flex items-start sm:items-center gap-2.5 p-3 rounded-lg border text-xs leading-relaxed ${
                        isOptimalRatio
                          ? "bg-sticker-teal/10 border-sticker-teal/30 text-sticker-teal"
                          : "bg-sticker-amber/10 border-sticker-amber/30 text-sticker-amber-deep"
                      }`}
                    >
                      {isOptimalRatio ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
                      )}
                      <span>
                        {isOptimalRatio
                          ? t.banners.dimensionOptimal
                              .replace("{width}", String(imageDimensions.width))
                              .replace("{height}", String(imageDimensions.height))
                          : t.banners.dimensionWarning
                              .replace("{width}", String(imageDimensions.width))
                              .replace("{height}", String(imageDimensions.height))
                              .replace("{ratio}", String(imageDimensions.ratio))}
                      </span>
                    </div>
                  )}

                  {/* Live Layout Preview (Exact 3:1 home carousel container) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-ink-muted font-medium">
                      <span>{t.banners.previewTitle}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-7 text-xs gap-1.5"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{t.banners.changeImage}</span>
                      </Button>
                    </div>

                    <div className="relative w-full aspect-[3/1] min-h-[160px] md:min-h-[260px] rounded-lg overflow-hidden border border-hairline bg-black shadow-notion-soft">
                      <img
                        src={previewBlobUrl}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Title & Link URL inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="banner-title"
                  className="text-xs font-semibold text-ink"
                >
                  {t.banners.bannerTitle} *
                </label>
                <Input
                  id="banner-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.banners.bannerTitlePlaceholder}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="banner-link"
                  className="text-xs font-semibold text-ink"
                >
                  {t.banners.linkUrl}
                </label>
                <Input
                  id="banner-link"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder={t.banners.linkUrlPlaceholder}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Active Toggle & Save Button */}
            <div className="flex items-center justify-between pt-3 border-t border-hairline">
              <label className="flex items-center gap-2 text-xs font-medium text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-hairline text-notion-blue focus:ring-notion-blue"
                />
                <span>{t.banners.activeStatus}</span>
              </label>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetForm}
                >
                  {t.common.cancel}
                </Button>
                <Button
                  type="submit"
                  variant="pill"
                  size="sm"
                  disabled={isUploadingImage || !selectedFile || !title.trim()}
                  className="gap-1.5 cursor-pointer"
                >
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t.common.saving}</span>
                    </>
                  ) : (
                    <span>{t.common.save}</span>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Existing Banners List */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
            Configured Banners ({banners.length})
          </h2>

          {isLoading ? (
            <div className="p-12 text-center text-xs text-ink-muted">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-notion-blue" />
              <span>{t.common.loading}</span>
            </div>
          ) : banners.length === 0 ? (
            <div className="p-12 rounded-xl border border-dashed border-hairline bg-surface text-center">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-ink-faint" />
              <p className="text-xs text-ink-muted">{t.banners.noBanners}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className="rounded-lg border border-hairline bg-surface p-4 shadow-notion-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-28 aspect-[3/1] rounded bg-canvas-soft border border-hairline overflow-hidden shrink-0">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-ink truncate leading-tight">
                          {banner.title}
                        </h3>
                        <Badge
                          variant={banner.isActive ? "teal" : "secondary"}
                          className="text-[10px] px-1.5 py-0 h-4 font-normal shrink-0"
                        >
                          {banner.isActive ? t.common.active : t.common.inactive}
                        </Badge>
                      </div>

                      {banner.linkUrl && (
                        <a
                          href={banner.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-notion-blue transition-colors mt-0.5 truncate font-mono"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{banner.linkUrl}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Right: Order & Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    {/* Reorder buttons */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => handleMove(index, "up")}
                      aria-label="Move up"
                      className="w-7 h-7 text-ink-muted hover:text-ink"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === banners.length - 1}
                      onClick={() => handleMove(index, "down")}
                      aria-label="Move down"
                      className="w-7 h-7 text-ink-muted hover:text-ink"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>

                    {/* Active toggle button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(banner)}
                      aria-label={banner.isActive ? "Deactivate" : "Activate"}
                      className="w-7 h-7 text-ink-muted hover:text-ink"
                    >
                      {banner.isActive ? (
                        <Eye className="w-3.5 h-3.5 text-sticker-teal" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                    </Button>

                    {/* Delete button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(banner.id)}
                      aria-label="Delete banner"
                      className="w-7 h-7 text-sticker-red hover:bg-sticker-red/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
