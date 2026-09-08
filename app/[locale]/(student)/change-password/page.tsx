"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api/client";
import { useTranslation } from "@/lib/i18n/language-context";
import { ensureLocale } from "@/lib/auth/redirect-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

type ChangePasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export default function ChangePasswordPage() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const changePasswordSchema = useMemo(
    () =>
      z
        .object({
          currentPassword: z.string().min(1, t.student.currentPasswordRequired),
          newPassword: z
            .string()
            .min(8, t.validations.passwordMinLength)
            .regex(passwordRegex, t.validations.passwordTooWeak),
          confirmNewPassword: z.string(),
        })
        .refine((data) => data.newPassword === data.confirmNewPassword, {
          message: t.validations.passwordsDoNotMatch,
          path: ["confirmNewPassword"],
        }),
    [t],
  );

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  async function onSubmit(values: ChangePasswordFormValues) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await apiClient.post("/auth/change-password", {
        body: {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
      });

      toast.success(t.student.passwordChangedSuccess);
      form.reset();
      router.push(ensureLocale("/profile", language));
    } catch (err: any) {
      if (err?.statusCode === 400 || err?.statusCode === 401) {
        setErrorMessage(t.student.currentPasswordIncorrect);
      } else {
        setErrorMessage(err?.message || t.common.error);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink">{t.student.changePasswordTitle}</h1>
        <p className="text-sm text-ink-muted mt-1">
          {t.student.changePasswordSubtitle}
        </p>
      </div>

      <Card className="border-hairline shadow-notion-soft bg-surface rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-ink">
            {t.student.changePasswordTitle}
          </CardTitle>
          <CardDescription className="text-sm text-ink-muted">
            {t.student.updatePasswordDesc}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMessage && (
            <div className="mb-4 p-3 rounded-md bg-sticker-orange/10 border border-sticker-orange/20 flex items-start gap-2.5 text-sm text-sticker-orange-deep">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-sticker-orange" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-ink-secondary">
                      {t.student.currentPassword}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-ink-secondary">
                      {t.auth.newPassword}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-ink-secondary">
                      {t.auth.confirmPassword}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t.common.saving}
                    </>
                  ) : (
                    t.student.savePasswordButton
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
