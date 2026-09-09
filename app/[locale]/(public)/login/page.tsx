"use client";

import React, { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth/auth-context";
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
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { getPostLoginRedirect } from "@/lib/auth/redirect-utils";
import { TurnstileWidget } from "@/components/common/turnstile-widget";
import { AlertCircle, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";
import { LocalizedLink } from "@/components/common/localized-link";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

const createLoginSchema = (t: Dictionary) =>
  z.object({
    email: z.string().email(t.validations.emailInvalid),
    password: z.string().min(1, t.validations.passwordRequired),
  });

type LoginFormValues = {
  email: string;
  password: string;
};

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useTranslation();
  const returnUrl =
    searchParams.get("returnUrl") ||
    searchParams.get("redirect") ||
    `/${language}`;
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setErrorMessage(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const loginSchema = useMemo(() => createLoginSchema(t), [t]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const authData = await login({
        ...values,
        turnstileToken: turnstileToken || undefined,
      });
      const destination = getPostLoginRedirect(authData.user.role, returnUrl, language);
      router.push(destination);
    } catch (err: any) {
      setResetKey((k) => k + 1);
      if (err?.statusCode === 429) {
        setErrorMessage(t.errors.rateLimited);
      } else if (err?.statusCode === 401) {
        setErrorMessage(t.errors.unauthorized);
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
              {t.auth.loginTitle}
            </CardTitle>
            <CardDescription className="text-ink-muted text-xs sm:text-sm">
              {t.auth.loginSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
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

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs font-semibold text-ink-secondary">
                          {t.auth.password}
                        </FormLabel>
                        <LocalizedLink
                          href="/forgot-password"
                          className="text-xs text-notion-blue hover:underline"
                        >
                          {t.auth.forgotPassword}
                        </LocalizedLink>
                      </div>
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

                <TurnstileWidget action="login" resetSignal={resetKey} onVerify={setTurnstileToken} />

                <Button
                  type="submit"
                  className="w-full h-10 font-semibold cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t.auth.signingIn}
                    </>
                  ) : (
                    t.auth.signIn
                  )}
                </Button>
              </form>
            </Form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-hairline" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface px-2.5 text-ink-muted font-medium">
                  {t.auth.orContinueWith}
                </span>
              </div>
            </div>

            <GoogleSignInButton mode="signin" returnUrl={returnUrl} />

            <div className="mt-6 text-center text-sm text-ink-muted">
              {t.auth.dontHaveAccount}{" "}
              <LocalizedLink
                href="/register"
                className="font-medium text-notion-blue hover:underline"
              >
                {t.auth.signUp}
              </LocalizedLink>
            </div>
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

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <LoginFormContent />
    </Suspense>
  );
}
