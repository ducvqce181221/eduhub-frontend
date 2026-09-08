"use client";

import React, { useState, useMemo } from "react";
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
import { TurnstileWidget } from "@/components/common/turnstile-widget";
import { AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";
import { LocalizedLink } from "@/components/common/localized-link";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

const createForgotPasswordSchema = (t: Dictionary) =>
  z.object({
    email: z.string().email(t.validations.emailInvalid),
  });

type ForgotPasswordFormValues = {
  email: string;
};

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [resetKey, setResetKey] = useState(0);

  const forgotPasswordSchema = useMemo(() => createForgotPasswordSchema(t), [t]);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const body: Record<string, any> = { email: values.email };
      if (turnstileToken) {
        body.turnstileToken = turnstileToken;
      }
      await apiClient.post("/auth/forgot-password", {
        body,
        skipAuth: true,
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setResetKey((k) => k + 1);
      if (err?.statusCode === 429) {
        setErrorMessage(t.errors.rateLimited);
      } else {
        setErrorMessage(err?.message || t.errors.generic);
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
              {t.auth.forgotPasswordTitle}
            </CardTitle>
            <CardDescription className="text-ink-muted text-xs sm:text-sm">
              {t.auth.forgotPasswordSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="space-y-6 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-sticker-teal/20 text-sticker-teal flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-ink">
                    {t.common.notice}
                  </h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    {t.auth.forgotPasswordSubtitle}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full h-10 font-semibold cursor-pointer"
                  asChild
                >
                  <LocalizedLink href="/login">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <span>{t.auth.signIn}</span>
                  </LocalizedLink>
                </Button>
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-ink-secondary">
                            {t.auth.email}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="name@example.com"
                              autoComplete="email"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <TurnstileWidget action="forgot_password" resetSignal={resetKey} onVerify={setTurnstileToken} />

                    <Button
                      type="submit"
                      className="w-full h-10 font-semibold cursor-pointer"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t.auth.sendingResetLink}
                        </>
                      ) : (
                        t.auth.sendResetLink
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 text-center text-sm text-ink-muted">
                  <LocalizedLink
                    href="/login"
                    className="inline-flex items-center gap-1.5 font-medium text-notion-blue hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    {t.auth.signIn}
                  </LocalizedLink>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
