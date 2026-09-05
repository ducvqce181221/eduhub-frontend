"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api/client";
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
import { RoleGuard } from "@/components/auth/role-guard";
import { AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        passwordRegex,
        "Password must contain uppercase, lowercase, number, and special character (@$!%*?&)",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!token) {
      setErrorMessage("Reset token is missing or invalid");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await apiClient.post("/auth/reset-password", {
        body: {
          token,
          newPassword: values.newPassword,
        },
        skipAuth: true,
      });
      setIsSuccess(true);
    } catch (err: any) {
      if (err?.statusCode === 400) {
        setErrorMessage("Invalid or expired reset token. Please request a new link.");
      } else {
        setErrorMessage(err?.message || "Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <RoleGuard guestOnly>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-canvas-soft">
        <Card className="w-full max-w-md border-hairline shadow-notion-soft bg-surface rounded-lg">
          <CardHeader className="space-y-1.5 text-center">
            <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
              Set New Password
            </CardTitle>
            <CardDescription className="text-ink-muted text-xs sm:text-sm">
              Please enter and confirm your new secure password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 bg-sticker-teal/20 text-sticker-teal rounded-full flex items-center justify-center mx-auto border border-sticker-teal/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-ink">Password reset successful</h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  Your password has been updated. You can now sign in with your new credentials.
                </p>
                <div className="pt-2">
                  <Button className="w-full h-10 font-semibold cursor-pointer" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
              </div>
            ) : !token ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 bg-sticker-orange/15 text-sticker-orange rounded-full flex items-center justify-center mx-auto border border-sticker-orange/30">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-ink">Invalid or Missing Token</h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  The password reset link is invalid or has expired. Please request a new one.
                </p>
                <div className="pt-2">
                  <Button variant="outline" className="w-full h-10 font-semibold cursor-pointer" asChild>
                    <Link href="/forgot-password">Request New Link</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {errorMessage && (
                  <div className="mb-4 p-3 rounded-md bg-sticker-orange/10 border border-sticker-orange/20 flex items-start gap-2.5 text-xs sm:text-sm text-sticker-orange-deep">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-sticker-orange" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-ink-secondary">New Password</FormLabel>
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
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-ink-secondary">Confirm New Password</FormLabel>
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

                    <Button
                      type="submit"
                      className="w-full h-10 font-semibold cursor-pointer"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Resetting password...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 text-center text-sm text-ink-muted">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 font-medium text-notion-blue hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Sign In
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}

function AuthCardSkeleton() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-canvas-soft">
      <div className="w-full max-w-md rounded-lg border border-hairline bg-surface p-6 sm:p-8 shadow-notion-soft space-y-6">
        <div className="space-y-2 text-center">
          <div className="h-6 w-44 mx-auto rounded-md bg-neutral-200/80 animate-pulse" />
          <div className="h-4 w-56 mx-auto rounded-md bg-neutral-200/60 animate-pulse" />
        </div>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="h-3.5 w-16 rounded-md bg-neutral-200/70 animate-pulse" />
            <div className="h-9 w-full rounded-md bg-neutral-200/60 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-3.5 w-16 rounded-md bg-neutral-200/70 animate-pulse" />
            <div className="h-9 w-full rounded-md bg-neutral-200/60 animate-pulse" />
          </div>
          <div className="h-10 w-full rounded-md bg-neutral-200/80 animate-pulse mt-4" />
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
