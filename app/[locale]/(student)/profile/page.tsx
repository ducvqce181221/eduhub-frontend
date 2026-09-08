"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useTranslation } from "@/lib/i18n/language-context";
import { translateRole } from "@/lib/i18n/formatters";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Check, Loader2, AlertCircle, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/types/api";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t.student.avatarTooLarge);
      return;
    }

    setIsUploadingAvatar(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await apiClient.post<{ url: string; secureUrl?: string }>("/upload/image", {
        body: formData,
      });

      const uploadedUrl = res.data?.secureUrl || res.data?.url;
      if (uploadedUrl) {
        setAvatarUrl(uploadedUrl);
        await apiClient.patch<User>("/auth/me", {
          body: { avatarUrl: uploadedUrl },
        });
        updateUser({ avatarUrl: uploadedUrl });
        toast.success(t.student.avatarUpdated);
      }
    } catch (err: any) {
      toast.error(err?.message || t.student.avatarUpdateFailed);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage(t.validations.nameRequired);
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.patch<User>("/auth/me", {
        body: { fullName: fullName.trim() },
      });

      if (res.data) {
        updateUser({ fullName: fullName.trim() });
        toast.success(t.student.profileUpdated);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || t.student.profileUpdateFailed);
      toast.error(t.student.profileUpdateFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "admin" as const;
      case "TEACHER":
        return "teacher" as const;
      default:
        return "student" as const;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink">{t.student.profileTitle}</h1>
        <p className="text-sm text-ink-muted mt-1">
          {t.student.profileSubtitle}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Avatar & Summary */}
        <Card className="border-hairline shadow-notion-soft bg-surface rounded-lg md:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="relative mx-auto mb-4 group w-24 h-24">
              <Avatar className="w-24 h-24 border border-hairline shadow-2xs">
                {(avatarUrl || user.avatarUrl) && (
                  <AvatarImage src={avatarUrl || user.avatarUrl || ""} alt={user.fullName} />
                )}
                <AvatarFallback className="bg-notion-blue text-white text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:pointer-events-none cursor-pointer"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span className="text-xs font-medium">{t.student.changeAvatar}</span>
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <CardTitle className="text-lg font-bold text-ink">
              {user.fullName}
            </CardTitle>
            <CardDescription className="text-xs text-ink-muted">{user.email}</CardDescription>
          </CardHeader>

          <CardContent className="pt-2 flex flex-col items-center justify-center">
            <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs font-semibold">
              {translateRole(user.role, t)}
            </Badge>
          </CardContent>
        </Card>

        {/* Right Column: Edit Profile Details */}
        <Card className="border-hairline shadow-notion-soft bg-surface rounded-lg md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-ink">
              {t.student.accountInfo}
            </CardTitle>
            <CardDescription className="text-sm text-ink-muted">
              {t.student.accountInfoDesc}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {errorMessage && (
              <div className="mb-4 p-3 rounded-md bg-sticker-orange/10 border border-sticker-orange/20 flex items-start gap-2.5 text-sm text-sticker-orange-deep">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-sticker-orange" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-semibold text-ink-secondary">
                  {t.auth.fullName}
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isSaving}
                  placeholder={t.auth.fullName}
                  className="max-w-md"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-ink-secondary">
                  {t.auth.email}
                </Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="max-w-md bg-canvas-soft text-ink-muted cursor-not-allowed"
                />
                <p className="text-xs text-ink-faint">
                  {t.student.emailCannotChange}
                </p>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSaving || isUploadingAvatar || fullName === user.fullName}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t.common.saving}
                    </>
                  ) : (
                    t.common.save
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
