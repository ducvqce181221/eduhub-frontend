"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
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
import { AlertCircle, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl =
    searchParams.get("returnUrl") ||
    searchParams.get("redirect") ||
    "/";
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setErrorMessage(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

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
      const authData = await login(values);
      const destination = getPostLoginRedirect(authData.user.role, returnUrl);
      router.push(destination);
    } catch (err: any) {
      if (err?.statusCode === 429) {
        setErrorMessage("Too many login attempts. Please try again in a minute.");
      } else if (err?.statusCode === 401) {
        setErrorMessage("Invalid email or password. Please check your credentials.");
      } else {
        setErrorMessage(err?.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <RoleGuard guestOnly>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-canvas-soft">
        <Card className="w-full max-w-md border-hairline shadow-notion-soft bg-surface rounded-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-ink">
              Sign in to EduHub
            </CardTitle>
            <CardDescription className="text-ink-muted text-sm">
              Enter your email and password to access your courses
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-ink-secondary">Email</FormLabel>
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
                        <FormLabel className="text-xs font-semibold text-ink-secondary">Password</FormLabel>
                        <Link
                          href="/forgot-password"
                          className="text-xs text-notion-blue hover:underline"
                        >
                          Forgot password?
                        </Link>
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

                <Button
                  type="submit"
                  className="w-full h-9.5"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
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
                  Or continue with
                </span>
              </div>
            </div>

            <GoogleSignInButton mode="signin" returnUrl={returnUrl} />

            <div className="mt-6 text-center text-sm text-ink-muted">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-notion-blue hover:underline"
              >
                Sign up as a student
              </Link>
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
      <div className="w-full max-w-md rounded-2xl border border-hairline bg-surface p-8 shadow-notion-soft space-y-6">
        <div className="space-y-2 text-center">
          <div className="h-7 w-48 mx-auto rounded-md bg-neutral-200/80 animate-pulse" />
          <div className="h-4 w-64 mx-auto rounded-md bg-neutral-200/60 animate-pulse" />
        </div>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="h-4 w-20 rounded-md bg-neutral-200/70 animate-pulse" />
            <div className="h-10 w-full rounded-lg bg-neutral-200/60 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 rounded-md bg-neutral-200/70 animate-pulse" />
            <div className="h-10 w-full rounded-lg bg-neutral-200/60 animate-pulse" />
          </div>
          <div className="h-10 w-full rounded-full bg-neutral-200/80 animate-pulse mt-4" />
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
