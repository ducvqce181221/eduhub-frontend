"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { TurnstileWidget } from "@/components/common/turnstile-widget";
import { AlertCircle, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";
import { LocalizedLink } from "@/components/common/localized-link";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const createRegisterSchema = (t: Dictionary) =>
  z
    .object({
      fullName: z.string().min(2, t.validations.nameMinLength),
      email: z.string().email(t.validations.emailInvalid),
      password: z
        .string()
        .min(8, t.validations.passwordMinLength)
        .regex(passwordRegex, t.validations.passwordTooWeak),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t.validations.passwordsDoNotMatch,
      path: ["confirmPassword"],
    });

type RegisterFormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, login } = useAuth();
  const { t, language } = useTranslation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [resetKey, setResetKey] = useState(0);

  const registerSchema = useMemo(() => createRegisterSchema(t), [t]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await registerUser({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        turnstileToken: turnstileToken || undefined,
      });

      // Auto login after registration
      await login({
        email: values.email,
        password: values.password,
      });

      router.push(`/${language}`);
    } catch (err: any) {
      setResetKey((k) => k + 1);
      if (err?.statusCode === 409) {
        setErrorMessage(t.errors.conflict);
      } else if (err?.statusCode === 429) {
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
              {t.auth.registerTitle}
            </CardTitle>
            <CardDescription className="text-ink-muted text-xs sm:text-sm">
              {t.auth.registerSubtitle}
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
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-ink-secondary">
                        {t.auth.fullName}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          autoComplete="name"
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
                      <FormLabel className="text-xs font-semibold text-ink-secondary">
                        {t.auth.password}
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
                  name="confirmPassword"
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

                <TurnstileWidget action="signup" resetSignal={resetKey} onVerify={setTurnstileToken} />

                <Button
                  type="submit"
                  className="w-full h-10 font-semibold cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t.auth.signingUp}
                    </>
                  ) : (
                    t.auth.signUp
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

            <GoogleSignInButton mode="signup" />

            <div className="mt-6 text-center text-sm text-ink-muted">
              {t.auth.alreadyHaveAccount}{" "}
              <LocalizedLink
                href="/login"
                className="font-medium text-notion-blue hover:underline"
              >
                {t.auth.signIn}
              </LocalizedLink>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
